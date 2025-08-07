import React from 'react';

const CkeditorPreview = ({ htmlContent }) => {
  return (
    <div
      className="ckeditor-preview"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default CkeditorPreview;
