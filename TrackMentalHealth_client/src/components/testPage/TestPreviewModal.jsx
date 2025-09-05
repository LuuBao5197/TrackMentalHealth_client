import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const TestPreviewModal = ({ show, onClose, testData, title }) => {
  if (!testData) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4 className="text-primary">{testData.title}</h4>
        <p><strong>Description:</strong> {testData.description}</p>
        <p><strong>Instructions:</strong> {testData.instructions}</p>
        <hr />
        {testData.questions && testData.questions.map((q, qIdx) => (
          <div key={qIdx} className="mb-4">
            <h5 className="text-dark">
              Question {qIdx + 1}: {q.questionText}
            </h5>
            <div className="ms-3">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    disabled
                    name={`question_${qIdx}`}
                  />
                  <label className="form-check-label">
                    {opt.optionText}
                    <small className="text-muted ms-2">(Score: {opt.scoreValue})</small>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TestPreviewModal;
