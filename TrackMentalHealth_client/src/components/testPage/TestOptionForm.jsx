import React, { useEffect, useState } from 'react';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const FullTestFormWithPreview = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const [previewMode, setPreviewMode] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: '',
      description: '',
      instructions: '',
      questions: []
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Tiêu đề bắt buộc'),
      description: Yup.string().required('Mô tả bắt buộc'),
      instructions: Yup.string().required('Hướng dẫn bắt buộc'),
      questions: Yup.array().of(
        Yup.object().shape({
          questionText: Yup.string().required('Câu hỏi là bắt buộc'),
          questionType: Yup.string().required('Loại là bắt buộc'),
          questionOrder: Yup.number(),
          options: Yup.array()
            .of(
              Yup.object().shape({
                optionText: Yup.string().required('Đáp án là bắt buộc'),
                scoreValue: Yup.number()
                  .required('Điểm là bắt buộc')
                  .min(1, 'Điểm phải từ 1 đến 4')
                  .max(4, 'Điểm phải từ 1 đến 4'),
                optionOrder: Yup.number()
              })
            )
            .min(1, 'Cần ít nhất 1 đáp án')
            .max(4, 'Tối đa 4 đáp án')
            .test(
              'unique-scores',
              'Các đáp án phải có điểm số khác nhau (1-4)',
              (options) => {
                const scores = options.map((o) => o.scoreValue);
                return new Set(scores).size === scores.length;
              }
            )
        })
      ).min(1, 'Cần ít nhất 1 câu hỏi')
    }),
    onSubmit: async (values) => {
      const payload = {
        ...values,
        questions: values.questions.map((q, qIdx) => ({
          ...q,
          questionOrder: qIdx + 1,
          options: q.options.map((opt, oIdx) => ({
            ...opt,
            optionOrder: oIdx + 1
          }))
        }))
      };

      try {
        if (isEditMode) {
          await axios.put(`http://localhost:9999/api/test/full/${id}`, payload);
          alert('Cập nhật thành công!');
        } else {
          await axios.post('http://localhost:9999/api/test/full', payload);
          alert('Tạo thành công!');
        }
        formik.resetForm();
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi lưu dữ liệu!');
      }
    }
  });

  useEffect(() => {
    if (isEditMode) {
      axios.get(`http://localhost:9999/api/test/full/${id}`)
        .then(res => formik.setValues(res.data))
        .catch(err => console.error('Load lỗi:', err));
    }
  }, [id]);

  return (
    <div className="container mt-4">
      <h3>{isEditMode ? 'Cập nhật' : 'Tạo'} bài thi</h3>

      <button className="btn btn-warning mb-3" onClick={() => setPreviewMode(!previewMode)}>
        {previewMode ? 'Tắt Preview' : 'Xem Preview'}
      </button>

      {previewMode ? (
        <div>
          <h4>{formik.values.title}</h4>
          <p><strong>Mô tả:</strong> {formik.values.description}</p>
          <p><strong>Hướng dẫn:</strong> {formik.values.instructions}</p>
          <hr />
          {formik.values.questions.map((q, qIdx) => (
            <div key={qIdx} className="mb-4">
              <h5>Câu {qIdx + 1}: {q.questionText}</h5>
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="form-check">
                  <input className="form-check-input" type="radio" name={`question_${qIdx}`} />
                  <label className="form-check-label">
                    {opt.optionText} <small className="text-muted">(Điểm: {opt.scoreValue})</small>
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tiêu đề</label>
            <input type="text" className="form-control" name="title" value={formik.values.title} onChange={formik.handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <textarea className="form-control" name="description" value={formik.values.description} onChange={formik.handleChange}></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Hướng dẫn</label>
            <textarea className="form-control" name="instructions" value={formik.values.instructions} onChange={formik.handleChange}></textarea>
          </div>

          <FormikProvider value={formik}>
            <FieldArray name="questions" render={({ push, remove }) => (
              <div>
                {formik.values.questions.map((q, qIdx) => (
                  <div key={qIdx} className="card p-3 mb-3">
                    <h5>Câu hỏi {qIdx + 1}</h5>
                    <input
                      type="text"
                      placeholder="Nội dung câu hỏi"
                      className="form-control mb-2"
                      name={`questions[${qIdx}].questionText`}
                      value={q.questionText}
                      onChange={formik.handleChange}
                    />
                    <input
                      type="text"
                      placeholder="Loại câu hỏi"
                      className="form-control mb-2"
                      name={`questions[${qIdx}].questionType`}
                      value={q.questionType}
                      onChange={formik.handleChange}
                    />

                    <FieldArray name={`questions[${qIdx}].options`} render={({ push, remove }) => (
                      <div>
                        <h6>Đáp án</h6>
                        {q.options.map((opt, oIdx) => {
                          const currentScores = q.options.map(o => o.scoreValue);
                          const isDuplicate = currentScores.filter(score => score === opt.scoreValue).length > 1;
                          const isOutOfRange = opt.scoreValue < 1 || opt.scoreValue > 4;
                          return (
                            <div key={oIdx} className="row mb-2">
                              <div className="col-md-5">
                                <input
                                  type="text"
                                  placeholder="Nội dung đáp án"
                                  className="form-control"
                                  name={`questions[${qIdx}].options[${oIdx}].optionText`}
                                  value={opt.optionText}
                                  onChange={formik.handleChange}
                                />
                              </div>
                              <div className="col-md-3">
                                <input
                                  type="number"
                                  placeholder="Điểm (1-4)"
                                  className={`form-control ${(isDuplicate || isOutOfRange) ? 'is-invalid' : ''}`}
                                  name={`questions[${qIdx}].options[${oIdx}].scoreValue`}
                                  value={opt.scoreValue}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    formik.setFieldValue(`questions[${qIdx}].options[${oIdx}].scoreValue`, value);
                                  }}
                                />
                                {(isDuplicate || isOutOfRange) && (
                                  <div className="invalid-feedback">
                                    {isOutOfRange
                                      ? 'Điểm phải nằm trong khoảng từ 1 đến 4'
                                      : 'Điểm này đã bị trùng trong đáp án'}
                                  </div>
                                )}
                              </div>
                              <div className="col-md-2">
                                <button className="btn btn-danger" type="button" onClick={() => remove(oIdx)} disabled={q.options.length <= 1}>Xoá</button>
                              </div>
                            </div>
                          );
                        })}
                        {q.options.length < 4 && (
                          <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={() => {
                              const usedScores = q.options.map(o => o.scoreValue);
                              const availableScore = [1, 2, 3, 4].find(s => !usedScores.includes(s)) || 0;
                              push({ optionText: '', scoreValue: availableScore, optionOrder: q.options.length + 1 });
                            }}
                          >
                            + Thêm đáp án
                          </button>
                        )}
                      </div>
                    )} />
                    <hr />
                    <button className="btn btn-danger" type="button" onClick={() => remove(qIdx)}>Xoá câu hỏi</button>
                  </div>
                ))}

                <button className="btn btn-primary mt-3" type="button" onClick={() => push({ questionText: '', questionType: '', questionOrder: formik.values.questions.length + 1, options: [] })}>
                  + Thêm câu hỏi
                </button>
              </div>
            )} />
          </FormikProvider>

          <div className="mt-4">
            <button type="submit" className="btn btn-success">Lưu bài thi</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FullTestFormWithPreview;
