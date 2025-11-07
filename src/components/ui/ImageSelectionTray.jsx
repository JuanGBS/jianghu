import React, { useRef } from 'react';
import Modal from './Modal';
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/24/solid';

function ImageSelectionTray({ isOpen, onClose, images, onSelect, onUpload }) {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-2">
        <h3 className="text-xl font-bold text-brand-text mb-4">Galeria de Imagens</h3>
        
        <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {images.map((image) => (
            <button 
              key={image.id}
              onClick={() => onSelect(image.publicURL)}
              className="aspect-square bg-gray-200 rounded-lg overflow-hidden group relative focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <img src={image.publicURL} alt={image.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PhotoIcon className="h-8 w-8 text-white" />
              </div>
            </button>
          ))}

          <button
            onClick={handleUploadClick}
            className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-200 hover:border-purple-400 hover:text-purple-600 transition-colors"
          >
            <ArrowUpTrayIcon className="h-8 w-8" />
            <span className="text-sm font-semibold mt-1">Nova Imagem</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
      </div>
    </Modal>
  );
}

export default ImageSelectionTray;