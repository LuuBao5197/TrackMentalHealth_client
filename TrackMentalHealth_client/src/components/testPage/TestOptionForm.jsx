import React, { lazy, useEffect, useState } from 'react';
import { useFormik, FormikProvider, FieldArray, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Loadable from '../../layouts/full/shared/loadable/Loadable';
import { showAlert } from '../../utils/showAlert';
import { showConfirm } from '../../utils/showConfirm';
import CKEditorComponent from '../../utils/ckeditor/CkEditorComponent';

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
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required'),
      instructions: Yup.string().required('Instructions are required'),
      questions: Yup.array().of(
        Yup.object().shape({
          questionText: Yup.string().required('Question is required'),
          questionType: Yup.string().required('Type is required'),
          questionOrder: Yup.number(),
          options: Yup.array()
            .of(
              Yup.object().shape({
                optionText: Yup.string().trim('Cannot be only whitespace').required('Answer is required'),
                scoreValue: Yup.number()
                  .required('Score is required')
                  .typeError('Score must be a number'),
                optionOrder: Yup.number()
              })
            )
            .min(2, 'At least 2 answers are required')
            .test(
              'unique-and-valid-scores',
              'Scores must be unique and within the range from 1 to N (number of answers)',
              function (options) {
                if (!Array.isArray(options)) return false;
                const scores = options.map(o => o.scoreValue);

                const isValidRange = scores.every(score => typeof score === 'number' && score >= 0 && score <= options.length);
                const isUnique = new Set(scores).size === scores.length;

                return isValidRange && isUnique;
              }
            )
            .test(
              'unique-optionText',
              'Answer texts must be unique',
              (options) => {
                const texts = options.map((o) => o.optionText?.trim().toLowerCase());
                if (texts.some(text => !text)) return false;
                return new Set(texts).size === texts.length;
              }
            )
        })
      )
        .min(1, 'At least 1 question is required')
        .test(
          'unique-questionText',
          'Questions must be unique',
          (questions) => {
            const texts = questions.map(q => q.questionText?.trim().toLowerCase());
            return new Set(texts).size === texts.length;
          }
        )
    }),

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
        showAlert("Check information carefully before saving");
        return;
      }
      const payload = {
        ...values,
        id: isEditMode ? id : undefined,
        questions: values.questions.map((q, qIdx) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          questionOrder: qIdx + 1,
          options: q.options.map((opt, oIdx) => ({
            id: opt.id,
            optionText: opt.optionText,
            scoreValue: opt.scoreValue,
            optionOrder: oIdx + 1
          }))
        }))
      };

      try {
        if (isEditMode) {
          const confirm = await showConfirm("Are you sure you want to save?");
          if (!confirm) {
            return;
          }
          await axios.put(`http://localhost:9999/api/test/full/${id}`, payload);
          showAlert('Updated successfully!', "success");
          navigate(-1);
        } else {
          await axios.post('http://localhost:9999/api/test/full', payload);
          showAlert('Created successfully!');
          navigate(-1);
        }
        formik.resetForm();
      } catch (err) {
        console.error(err);
        showAlert('An error occurred while saving data!');
      }
    }
  });

  useEffect(() => {
    if (isEditMode) {
      axios.get(`http://localhost:9999/api/test/${id}`)
        .then(res => formik.setValues(res.data))
        .catch(err => console.error('Error loading:', err));
    }
  }, [id]);

  return (
    <div className="container mt-4">
      <h3>{isEditMode ? 'Update' : 'Create'} test</h3>

      <button className="btn btn-warning mb-3" onClick={() => setPreviewMode(!previewMode)}>
        {previewMode ? 'Hide Preview' : 'Show Preview'}
      </button>

      {previewMode ? (
        <div>
          <h4>{formik.values.title}</h4>
          <p><strong>Description:</strong> {formik.values.description}</p>
          <p><strong>Instructions:</strong> {formik.values.instructions}</p>
          <hr />
          {formik.values.questions.map((q, qIdx) => (
            <div key={qIdx} className="mb-4">
              <h5>Question {qIdx + 1}: {q.questionText}</h5>
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="form-check">
                  <input className="form-check-input" type="radio" name={`question_${qIdx}`} disabled />
                  <label className="form-check-label">
                    {opt.optionText} <small className="text-muted">(Score: {opt.scoreValue})</small>
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <Field
              name="title"
              component={CKEditorComponent}
              label="Title"
              placeholder="Enter the title"
              className="h-100"
            />
            <Field
              name="description"
              component={CKEditorComponent}
              label="Description"
              placeholder="Enter the description"
            />
            <Field
              name="instructions"
              component={CKEditorComponent}
              label="Instructions"
              placeholder="Enter the instructions"
            />

            <FieldArray name="questions" render={({ push, remove }) => (
              <div>
                {typeof formik.errors.questions === 'string' && formik.touched.questions && (
                  <div className="text-danger mb-2">{formik.errors.questions}</div>
                )}

                {formik.values.questions.map((q, qIdx) => (
                  <div key={qIdx} className="card p-3 mb-3">
                    <h5>Question {qIdx + 1}</h5>
                    <input
                      type="text"
                      placeholder="Enter question text"
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
                      placeholder="Enter question type"
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
                        <h6>Answers</h6>
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
                                  placeholder="Enter answer text"
                                  className="form-control"
                                  name={`questions[${qIdx}].options[${oIdx}].optionText`}
                                  value={opt.optionText}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
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
                                  placeholder="Score > 0"
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
                                      ? 'Score must be > 0 and not greater than number of answers'
                                      : 'This score is duplicated'}
                                  </div>
                                )}
                              </div>
                              <div className="col-md-2">
                                <button className="btn btn-danger" type="button" onClick={() => remove(oIdx)} disabled={q.options.length <= 1}>Delete</button>
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
                          + Add Answer
                        </button>
                      </div>
                    )} />
                    <hr />
                    <button className="btn btn-danger" type="button" onClick={() => remove(qIdx)}>Delete Question</button>
                  </div>
                ))}

                <button className="btn btn-primary mt-3" type="button" onClick={() => push({ questionText: '', questionType: '', questionOrder: formik.values.questions.length + 1, options: [] })}>
                  + Add Question
                </button>

                {formik.values.questions.length > 0 && (
                  <button
                    className="btn btn-info mt-3"
                    type="button"
                    onClick={() => {
                      const lastQuestion = formik.values.questions[formik.values.questions.length - 1];
                      const copiedQuestion = {
                        ...lastQuestion,
                        id: undefined,
                        questionOrder: formik.values.questions.length + 1,
                        options: lastQuestion.options.map((opt, idx) => ({
                          ...opt,
                          id: undefined,
                          optionOrder: idx + 1
                        }))
                      };
                      push(copiedQuestion);
                    }}
                  >
                    + Copy Previous Question
                  </button>
                )}
              </div>
            )} />

            <div className="mt-4">
              <button type="submit" className="btn btn-success">Save Test</button>
            </div>
          </form>
        </FormikProvider>
      )}
    </div>
  );
};

export default FullTestFormWithPreview;
