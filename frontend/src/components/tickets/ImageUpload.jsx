import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';

const ImageUpload = ({ onFilesSelected, maxFiles = 3 }) => {
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (previews.length + files.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }

    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
    onFilesSelected(prev => [...prev.map(p => p.file), ...files]);
  };

  const removeImage = (index) => {
    setPreviews(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesSelected(updated.map(p => p.file));
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors bg-slate-900/30 backdrop-blur-sm group"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          accept="image/*" 
          className="hidden" 
        />
        
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
            <UploadCloud size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-300 font-medium">Click to upload photos</p>
          <p className="text-slate-500 text-sm">PNG, JPG up to 5MB (Max {maxFiles} images)</p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-xl aspect-square">
              <img 
                src={preview.url} 
                alt="preview" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" 
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full shadow-lg transition-all scale-0 group-hover:scale-100"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[10px] text-white truncate px-1">{preview.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
