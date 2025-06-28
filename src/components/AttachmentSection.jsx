import React from 'react';
import './AttachmentSection.css';

const AttachmentSection = ({ consultationText = 'Diet consultation:', attachmentText = 'Attachment:', buttonText = 'Scan' }) => {
  return (
    <div className="attachment-section">
      <div className="consultation-text">{consultationText}</div>
      <div className="attachment-container">
        <div className="attachment-text">{attachmentText}</div>
        <button className="scan-button">
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  );
};

export default AttachmentSection;
