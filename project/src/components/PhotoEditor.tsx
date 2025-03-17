import React, { useState, useRef } from 'react';
import { Upload, Sliders, Image as ImageIcon, Save, Download, Crop, RotateCcw } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  filter: string | null;
  rotation: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PhotoEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    filter: null,
    rotation: 0
  });
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAdjustments({
          brightness: 100,
          contrast: 100,
          saturation: 100,
          filter: null,
          rotation: 0
        });
        setCropArea(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdjustmentChange = (type: keyof ImageAdjustments, value: number) => {
    setAdjustments(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const applyFilter = (filterName: string) => {
    setAdjustments(prev => ({
      ...prev,
      filter: filterName
    }));
  };

  const getFilterStyle = () => {
    const { brightness, contrast, saturation, filter, rotation } = adjustments;
    let style = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) rotate(${rotation}deg)`;
    
    if (filter) {
      switch (filter) {
        case 'grayscale':
          style += ' grayscale(100%)';
          break;
        case 'sepia':
          style += ' sepia(100%)';
          break;
        case 'blur':
          style += ' blur(2px)';
          break;
        case 'sharpen':
          style += ' contrast(150%) brightness(150%)';
          break;
        case 'vintage':
          style += ' sepia(50%) hue-rotate(-30deg) saturate(140%)';
          break;
        case 'cool':
          style += ' hue-rotate(180deg)';
          break;
        case 'warm':
          style += ' hue-rotate(-30deg) saturate(150%)';
          break;
        case 'dramatic':
          style += ' contrast(150%) brightness(90%) saturate(150%)';
          break;
      }
    }
    
    return style;
  };

  const startCrop = () => {
    setIsCropping(true);
    setCropStart(null);
    setCropArea(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !cropStart) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropArea({
      x: Math.min(cropStart.x, x),
      y: Math.min(cropStart.y, y),
      width: Math.abs(x - cropStart.x),
      height: Math.abs(y - cropStart.y)
    });
  };

  const handleMouseUp = () => {
    if (!isCropping) return;
    setIsCropping(false);
  };

  const applyCrop = () => {
    if (!imageRef.current || !cropArea || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleFactor = imageRef.current.naturalWidth / imageRef.current.width;

    canvas.width = cropArea.width * scaleFactor;
    canvas.height = cropArea.height * scaleFactor;

    ctx.filter = getFilterStyle();
    ctx.drawImage(
      imageRef.current,
      cropArea.x * scaleFactor,
      cropArea.y * scaleFactor,
      cropArea.width * scaleFactor,
      cropArea.height * scaleFactor,
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

    ctx.filter = getFilterStyle();
    ctx.drawImage(imageRef.current, 0, 0);

    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    if (!image) return;

    try {
      const templateParams = {
        to_email: prompt('Enter recipient email:'),
        message: 'Here is your edited image!',
        image_url: image
      };

      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        templateParams,
        'YOUR_PUBLIC_KEY'
      );

      alert('Image shared successfully!');
    } catch (error) {
      console.error('Error sharing image:', error);
      alert('Failed to share image. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div 
        className="col-span-9 bg-gray-50 rounded-lg p-4 min-h-[600px] flex items-center justify-center relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {image ? (
          <>
            <img
              ref={imageRef}
              src={image}
              alt="Uploaded"
              className="max-w-full max-h-[500px] object-contain transition-all duration-200"
              style={{ filter: getFilterStyle() }}
            />
            {cropArea && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500/10"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height
                }}
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
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
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold mb-4">Adjustments</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brightness ({adjustments.brightness}%)
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.brightness}
                onChange={(e) => handleAdjustmentChange('brightness', Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contrast ({adjustments.contrast}%)
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.contrast}
                onChange={(e) => handleAdjustmentChange('contrast', Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saturation ({adjustments.saturation}%)
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.saturation}
                onChange={(e) => handleAdjustmentChange('saturation', Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rotation ({adjustments.rotation}°)
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={adjustments.rotation}
                onChange={(e) => handleAdjustmentChange('rotation', Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Filters</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className={`btn-secondary text-sm ${adjustments.filter === 'grayscale' ? 'bg-blue-50' : ''}`}
                  onClick={() => applyFilter('grayscale')}
                >
                  Grayscale
                </button>
                <button 
                  className={`btn-secondary text-sm ${adjustments.filter === 'sepia' ? 'bg-blue-50' : ''}`}
                  onClick={() => applyFilter('sepia')}
                >
                  Sepia
                </button>
                <button 
                  className={`btn-secondary text-sm ${adjustments.filter === 'blur' ? 'bg-blue-50' : ''}`}
                  onClick={() => applyFilter('blur')}
                >
                  Blur
                </button>
                <button 
                  className={`btn-secondary text-sm ${adjustments.filter === 'sharpen' ? 'bg-blue-50' : ''}`}
                  onClick={() => applyFilter('sharpen')}
                >
                  Sharpen
                </button>
                <button 
                  className={`btn-secondary text-sm ${adjustments.filter === 'vintage' ? 'bg-blue-50' : ''}`}
                  onClick={() => applyFilter('vintage')}
                >
                  Vintage
                </button>
                <button 
                  className={`btn-secondary text-sm ${adjustments.filter === 'cool' ? 'bg-blue-50' : ''}`}
                  onClick={() => applyFilter('cool')}
                >
                  Cool
                </button>
                <button 
                  className={`btn-secondary text-sm ${adjustments.filter === 'warm' ? 'bg-blue-50' : ''}`}
                  onClick={() => applyFilter('warm')}
                >
                  Warm
                </button>
                <button 
                  className={`btn-secondary text-sm ${adjustments.filter === 'dramatic' ? 'bg-blue-50' : ''}`}
                  onClick={() => applyFilter('dramatic')}
                >
                  Dramatic
                </button>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Crop</h4>
              <div className="space-y-2">
                <button 
                  className={`btn-secondary w-full ${isCropping ? 'bg-blue-50' : ''}`}
                  onClick={startCrop}
                >
                  <Crop className="w-4 h-4 mr-2" />
                  Start Crop
                </button>
                {cropArea && (
                  <button 
                    className="btn-primary w-full"
                    onClick={applyCrop}
                  >
                    Apply Crop
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button 
              className="btn-primary w-full"
              onClick={handleShare}
              disabled={!image}
            >
              <Save className="w-4 h-4 mr-2" />
              Share via Email
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