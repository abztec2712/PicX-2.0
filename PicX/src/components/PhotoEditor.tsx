import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Save, Download, Crop, Mail, Undo } from 'lucide-react';

interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HistoryState {
  adjustments: ImageAdjustments;
  filter: string | null;
  image: string | null;
}

const PhotoEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    rotation: 0
  });
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const saveToHistory = () => {
    setHistory(prev => [...prev, {
      adjustments: { ...adjustments },
      filter,
      image
    }]);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setAdjustments(previousState.adjustments);
      setFilter(previousState.filter);
      if (previousState.image) {
        setImage(previousState.image);
      }
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveToHistory();
        setImage(reader.result as string);
        setAdjustments({
          brightness: 100,
          contrast: 100,
          saturation: 100,
          rotation: 0
        });
        setFilter(null);
        setCropArea(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFilterStyle = () => {
    const { brightness, contrast, saturation, rotation } = adjustments;
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    if (filter) {
      switch (filter) {
        case 'grayscale':
          filterString += ' grayscale(100%)';
          break;
        case 'sepia':
          filterString += ' sepia(100%)';
          break;
        case 'invert':
          filterString += ' invert(100%)';
          break;
        case 'blur':
          filterString += ' blur(2px)';
          break;
      }
    }
    
    return {
      filter: filterString,
      transform: `rotate(${rotation}deg)`
    };
  };

  const startCrop = () => {
    setIsCropping(true);
    setCropStart(null);
    setCropArea(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setCropStart({ x, y });
      // Initialize crop area to prevent jumping
      setCropArea({
        x,
        y,
        width: 0,
        height: 0
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !cropStart || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    let currentX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    let currentY = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);

    setCropArea({
      x: Math.min(cropStart.x, currentX),
      y: Math.min(cropStart.y, currentY),
      width: Math.abs(currentX - cropStart.x),
      height: Math.abs(currentY - cropStart.y)
    });
  };

  const handleMouseUp = () => {
    if (!isCropping || !cropArea || !cropArea.width || !cropArea.height) return;
    saveToHistory();
    applyCrop();
    setIsCropping(false);
  };

  const applyCrop = () => {
    if (!imageRef.current || !cropArea || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = cropArea.width * scaleX;
    canvas.height = cropArea.height * scaleY;

    const { filter } = getFilterStyle();
    ctx.filter = filter;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(adjustments.rotation * Math.PI / 180);
    ctx.translate(-canvas.width/2, -canvas.height/2);

    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const croppedImage = canvas.toDataURL('image/png');
    setImage(croppedImage);
    setCropArea(null);
  };

  const handleDownload = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;

    const { filter } = getFilterStyle();
    ctx.filter = filter;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(adjustments.rotation * Math.PI / 180);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    
    ctx.drawImage(imageRef.current, 0, 0);

    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;

    const { filter } = getFilterStyle();
    ctx.filter = filter;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(adjustments.rotation * Math.PI / 180);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    
    ctx.drawImage(imageRef.current, 0, 0);

    // Download the image first
    const imageDataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = imageDataUrl;
    link.click();

    // Open Gmail compose in a new tab
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=Check out my edited image&body=I've edited this image and wanted to share it with you.`;
    window.open(gmailUrl, '_blank');
  };

  const handleAdjustmentChange = (type: keyof ImageAdjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div 
        ref={editorRef}
        className="col-span-9 bg-gray-900 rounded-lg p-4 min-h-[600px] flex items-center justify-center relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {image ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              ref={imageRef}
              src={image}
              alt="Edited"
              className="max-w-full max-h-[500px] object-contain"
              style={getFilterStyle()}
            />
            {cropArea && (
              <div
                className="absolute border-2 border-cyan-400 bg-cyan-400/10"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  pointerEvents: 'none'
                }}
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}
      </div>

      <div className="col-span-3">
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg neon-border space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-cyan-400">Adjustments</h3>
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                title="Undo"
              >
                <Undo className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Brightness ({adjustments.brightness}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.brightness}
                  onChange={(e) => handleAdjustmentChange('brightness', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Contrast ({adjustments.contrast}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.contrast}
                  onChange={(e) => handleAdjustmentChange('contrast', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Saturation ({adjustments.saturation}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.saturation}
                  onChange={(e) => handleAdjustmentChange('saturation', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Rotation ({adjustments.rotation}°)
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={adjustments.rotation}
                  onChange={(e) => handleAdjustmentChange('rotation', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Filters</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                className={`btn-secondary text-sm ${filter === 'grayscale' ? 'bg-cyan-400/20' : ''}`}
                onClick={() => setFilter(filter === 'grayscale' ? null : 'grayscale')}
              >
                Grayscale
              </button>
              <button 
                className={`btn-secondary text-sm ${filter === 'sepia' ? 'bg-cyan-400/20' : ''}`}
                onClick={() => setFilter(filter === 'sepia' ? null : 'sepia')}
              >
                Sepia
              </button>
              <button 
                className={`btn-secondary text-sm ${filter === 'invert' ? 'bg-cyan-400/20' : ''}`}
                onClick={() => setFilter(filter === 'invert' ? null : 'invert')}
              >
                Invert
              </button>
              <button 
                className={`btn-secondary text-sm ${filter === 'blur' ? 'bg-cyan-400/20' : ''}`}
                onClick={() => setFilter(filter === 'blur' ? null : 'blur')}
              >
                Blur
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Tools</h3>
            <div className="space-y-2">
              <button 
                className={`btn-secondary w-full ${isCropping ? 'bg-cyan-400/20' : ''}`}
                onClick={startCrop}
                disabled={!image}
              >
                <Crop className="w-4 h-4 mr-2" />
                {isCropping ? 'Click and drag to crop' : 'Crop Image'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              className="btn-primary w-full"
              onClick={handleShare}
              disabled={!image}
            >
              <Mail className="w-4 h-4 mr-2" />
              Share via Gmail
            </button>
            <button 
              className="btn-secondary w-full"
              onClick={handleDownload}
              disabled={!image}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditor;