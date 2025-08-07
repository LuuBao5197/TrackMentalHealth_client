// components/CKEditorComponent.js
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CKEditorComponent = ({ field, form, label, placeholder }) => {
  const { name, value } = field;
  const { setFieldValue, errors, touched } = form;

  return (
    <div className="mb-3">
      {label && <label className="form-label fw-bold">{label}</label>}
      <div className={errors[name] && touched[name] ? 'border border-danger rounded' : ''}>
        <CKEditor
          editor={ClassicEditor}
          data={value}
          config={{ placeholder }}
          onChange={(event, editor) => {
            const data = editor.getData();
            setFieldValue(name, data);
          }}
          
        />
      </div>
      {errors[name] && touched[name] && (
        <div className="text-danger mt-1">{errors[name]}</div>
      )}
    </div>
  );
};

export default CKEditorComponent;
