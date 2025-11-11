import React from 'react';
import Modal from '../ui/Modal';

function InnateBodyInfoModal({ isOpen, onClose, body }) {
  if (!body) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 text-center">
        <h3 className="text-xl font-bold text-brand-text">{body.name}</h3>
        <p className="text-gray-600 whitespace-pre-line">
          {body.description}
        </p>
        <div className="pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-primary text-brand-text font-semibold rounded-md hover:brightness-105"
          >
            Entendi
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default InnateBodyInfoModal;