import React, { lazy, useEffect, useState } from 'react';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Loadable from '../../layouts/full/shared/loadable/Loadable';
import { showAlert } from '../../utils/showAlert';
import { showConfirm } from '../../utils/showConfirm';
// const OptionPage = Loadable(lazy(() => import('../testPage/ImportTestExcel')))

const FullTestFormWithPreview = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const [previewMode, setPreviewMode] = useState(false);
  const navigate = useNavigate();
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
                optionText: Yup.string().trim('Không chỉ được chứa khoảng trắng').required('Đáp án là bắt buộc'),
                scoreValue: Yup.number()
                  .required('Điểm là bắt buộc')
                  .typeError('Điểm phải là số'),
                optionOrder: Yup.number()
              })
            )
            .min(2, 'Cần ít nhất 2 đáp án')
            // .max(4, 'Tối đa 4 đáp án')
            .test(
              'unique-and-valid-scores',
              'Điểm phải khác nhau và nằm trong khoảng từ 1 đến N (số lượng đáp án)',
              function (options) {
                if (!Array.isArray(options)) return false;
                const scores = options.map(o => o.scoreValue);

                // 1. Check all are numbers in range 1..N
                const isValidRange = scores.every(score => typeof score === 'number' && score >= 0 && score <= options.length);

                // 2. Check no duplicates
                const isUnique = new Set(scores).size === scores.length;

                return isValidRange && isUnique;
              }
            )
            .test(
              'unique-optionText',
              'Các đáp án không được trùng nội dung',
              (options) => {
                const texts = options.map((o) => o.optionText?.trim().toLowerCase());
                if (texts.some(text => !text)) return false;
                return new Set(texts).size === texts.length;
              }
            )
        })
      )
        .min(1, 'Cần ít nhất 1 câu hỏi')
        .test(
          'unique-questionText',
          'Các câu hỏi không được trùng nội dung',
          (questions) => {
            const texts = questions.map(q => q.questionText?.trim().toLowerCase());
            return new Set(texts).size === texts.length;
          }
        )
    }),
    // (Toàn bộ nội dung bạn gửi ở trên vẫn giữ nguyên, chỉ highlight phần sửa)

    onSubmit: async (values, { setTouched }) => {
      const errors = await formik.validateForm();

      if (Object.keys(errors).length > 0) {
        const touchedQuestions = values.questions.map((q) => ({
          questionText: true,
          questionType: true,
          options: q.options.map(() => ({
            optionText: true,
            scoreValue: true
          }))
        }));

        setTouched({
          title: true,
          description: true,
          instructions: true,
          questions: touchedQuestions
        });
        showAlert("Check information carefully before save",);
        // alert('Vui lòng kiểm tra lại thông tin trước khi lưu!');
        return;
      }
      const payload = {
        ...values,
        id: isEditMode ? id : undefined, // 👈 nếu đang sửa, thêm id vào payload
        questions: values.questions.map((q, qIdx) => ({
          id: q.id, // 👈 giữ lại id câu hỏi nếu có
          questionText: q.questionText,
          questionType: q.questionType,
          questionOrder: qIdx + 1,
          options: q.options.map((opt, oIdx) => ({
            id: opt.id, // 👈 giữ lại id đáp án nếu có
            optionText: opt.optionText,
            scoreValue: opt.scoreValue,
            optionOrder: oIdx + 1
          }))
        }))
      };

      try {
        if (isEditMode) {
          const confirm = await showConfirm("Are you sure to save");
          if (!confirm) {
            return;
          }
          // await axios.put(`http://localhost:9999/api/test/full/${id}`, payload);
          console.log(payload);
          await axios.put(`http://localhost:9999/api/test/full/${id}`, payload);
          showAlert('Cập nhật thành công!', "success");
          navigate(-1);

        } else {
          await axios.post('http://localhost:9999/api/test/full', payload);
          showAlert('Tạo thành công!');
          navigate(-1);
        }
        formik.resetForm();
      } catch (err) {
        console.error(err);
        showAlert('Có lỗi xảy ra khi lưu dữ liệu!');
      }
    }



  });

  useEffect(() => {
    if (isEditMode) {
      axios.get(`http://localhost:9999/api/test/${id}`)
        .then(res => formik.setValues(res.data))
        .catch(err => console.error('Load lỗi:', err));
    }
  }, [id]);

  return (
    <div className="container mt-4">
      {/* <OptionPage /> */}
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
                  <input className="form-check-input" type="radio" name={`question_${qIdx}`} disabled />
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
            {formik.touched.title && formik.errors.title && <div className="text-danger">{formik.errors.title}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <textarea className="form-control" name="description" value={formik.values.description} onChange={formik.handleChange}></textarea>
            {formik.touched.description && formik.errors.description && <div className="text-danger">{formik.errors.description}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Hướng dẫn</label>
            <textarea className="form-control" name="instructions" value={formik.values.instructions} onChange={formik.handleChange}></textarea>
            {formik.touched.instructions && formik.errors.instructions && <div className="text-danger">{formik.errors.instructions}</div>}
          </div>

          <FormikProvider value={formik}>
            <FieldArray name="questions" render={({ push, remove }) => (
              <div>
                {typeof formik.errors.questions === 'string' && formik.touched.questions && (
                  <div className="text-danger mb-2">{formik.errors.questions}</div>
                )}

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
                    {formik.touched.questions?.[qIdx]?.questionText && formik.errors.questions?.[qIdx]?.questionText && (
                      <div className="text-danger">{formik.errors.questions[qIdx].questionText}</div>
                    )}
                    <input
                      type="text"
                      placeholder="Loại câu hỏi"
                      className="form-control mb-2"
                      name={`questions[${qIdx}].questionType`}
                      value={q.questionType}
                      onChange={formik.handleChange}
                    />
                    {formik.touched.questions?.[qIdx]?.questionType && formik.errors.questions?.[qIdx]?.questionType && (
                      <div className="text-danger">{formik.errors.questions[qIdx].questionType}</div>
                    )}

                    <FieldArray name={`questions[${qIdx}].options`} render={({ push, remove }) => (
                      <div>
                        <h6>Đáp án</h6>
                        {/* ✅ Nếu toàn bộ options bị thiếu thì hiển thị lỗi */}
                        {typeof formik.errors.questions?.[qIdx]?.options === 'string' && formik.touched.questions?.[qIdx]?.options && (
                          <div className="text-danger mb-2">{formik.errors.questions[qIdx].options}</div>
                        )}
                        {q.options.map((opt, oIdx) => {
                          const currentScores = q.options.map(o => o.scoreValue);
                          const isDuplicate = currentScores.filter(score => score === opt.scoreValue).length > 1;
                          const isOutOfRange = opt.scoreValue < 0 || opt.scoreValue > q.options.length;
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
                                  onBlur={formik.handleBlur} // 👈 đảm bảo Formik biết field này được "touch"
                                />
                                {formik.touched.questions?.[qIdx]?.options?.[oIdx]?.optionText &&
                                  formik.errors.questions?.[qIdx]?.options?.[oIdx]?.optionText && (
                                    <div className="text-danger mt-1">
                                      {formik.errors.questions[qIdx].options[oIdx].optionText}
                                    </div>
                                  )}
                              </div>

                              <div className="col-md-3">
                                <input
                                  type="number"
                                  placeholder="Điểm > 0 "
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
                                      ? 'Điểm phải > 0 và không lớn hơn số lượng đáp án'
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
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => {
                            const usedScores = q.options.map(o => o.scoreValue);
                            const nextScore = usedScores.length + 1;
                            push({ optionText: '', scoreValue: nextScore, optionOrder: q.options.length + 1 });
                          }}
                        >
                          + Thêm đáp án
                        </button>
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
