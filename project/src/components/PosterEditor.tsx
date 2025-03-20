import React, { useState, useRef } from 'react';
import { Layout, Type, Image as ImageIcon, Save, Download, Move, Crop } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  thumbnail: string;
}

interface TextElement {
  id: string;
  type: 'heading' | 'subheading' | 'body';
  content: string;
  position: { x: number; y: number };
  style: {
    color: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
  };
}

interface ImageElement {
  id: string;
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isCropping?: boolean;
}

const PosterEditor: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const templates: Template[] = [
    {
      id: 'template1',
      name: 'Business',
      thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=200&h=200&fit=crop'
    },
    {
      id: 'template2',
      name: 'Event',
      thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop'
    },
    {
      id: 'template3',
      name: 'Social Media',
      thumbnail: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=200&h=200&fit=crop'
    },
    {
      id: 'template4',
      name: 'Portfolio',
      thumbnail: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=200&h=200&fit=crop'
    },
    {
      id: 'template5',
      name: 'Wedding',
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop'
    },
    {
      id: 'template6',
      name: 'Restaurant',
      thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop'
    },
    {
      id: 'template7',
      name: 'Fashion',
      thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop'
    },
    {
      id: 'template8',
      name: 'Travel',
      thumbnail: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=200&h=200&fit=crop'
    },
    {
      id: 'template9',
      name: 'Minimal',
      thumbnail: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=200&h=200&fit=crop'
    },
    {
      id: 'template10',
      name: 'Creative',
      thumbnail: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=200&h=200&fit=crop'
    }
  ];

  const fontFamilies = [
    'Arial',
    'Times New Roman',
    'Helvetica',
    'Georgia',
    'Verdana',
    'Roboto',
    'Montserrat',
    'Open Sans',
    'Playfair Display',
    'Lato'
  ];

  const colors = [
    '#FFFFFF', // White
    '#22D3EE', // Cyan (Neon)
    '#F472B6', // Pink (Neon)
    '#34D399', // Green (Neon)
    '#A78BFA', // Purple (Neon)
    '#FB923C', // Orange (Neon)
    '#FBBF24', // Yellow (Neon)
    '#EC4899', // Hot Pink
    '#8B5CF6', // Violet
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#EF4444'  // Red
  ];

  const addTextElement = (type: 'heading' | 'subheading' | 'body') => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      type,
      content: 'Double click to edit',
      position: { x: 50, y: 50 },
      style: {
        color: '#FFFFFF',
        fontSize: type === 'heading' ? 32 : type === 'subheading' ? 24 : 16,
        fontFamily: 'Arial',
        fontWeight: type === 'heading' ? 'bold' : 'normal',
        textAlign: 'left'
      }
    };
    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: ImageElement = {
          id: `image-${Date.now()}`,
          url: reader.result as string,
          position: { x: 50, y: 50 },
          size: { width: 200, height: 200 }
        };
        setImageElements([...imageElements, newImage]);
        setSelectedElement(newImage.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleElementClick = (id: string) => {
    setSelectedElement(id);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (selectedElement === id) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedElement && editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (selectedElement.startsWith('text')) {
        setTextElements(elements =>
          elements.map(el =>
            el.id === selectedElement
              ? { ...el, position: { x, y } }
              : el
          )
        );
      } else if (selectedElement.startsWith('image')) {
        setImageElements(elements =>
          elements.map(el =>
            el.id === selectedElement
              ? { ...el, position: { x, y } }
              : el
          )
        );
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTextEdit = (id: string, content: string) => {
    setTextElements(elements =>
      elements.map(el =>
        el.id === id ? { ...el, content } : el
      )
    );
  };

  const updateTextStyle = (id: string, styleKey: keyof TextElement['style'], value: any) => {
    setTextElements(elements =>
      elements.map(el =>
        el.id === id
          ? { ...el, style: { ...el.style, [styleKey]: value } }
          : el
      )
    );
  };

  const handleImageResize = (id: string, width: number, height: number) => {
    setImageElements(elements =>
      elements.map(el =>
        el.id === id
          ? { ...el, size: { width, height } }
          : el
      )
    );
  };

  const toggleImageCrop = (id: string) => {
    setImageElements(elements =>
      elements.map(el =>
        el.id === id
          ? { ...el, isCropping: !el.isCropping }
          : el
      )
    );
  };

  const handleDownload = () => {
    if (!editorRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = editorRef.current.clientWidth;
    canvas.height = editorRef.current.clientHeight;

    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    [...textElements, ...imageElements].sort((a, b) => a.position.y - b.position.y).forEach(element => {
      if ('content' in element) {
        ctx.font = `${element.style.fontWeight} ${element.style.fontSize}px ${element.style.fontFamily}`;
        ctx.fillStyle = element.style.color;
        ctx.fillText(element.content, element.position.x, element.position.y);
      } else {
        const img = new Image();
        img.src = element.url;
        ctx.drawImage(img, element.position.x, element.position.y, element.size.width, element.size.height);
      }
    });

    const link = document.createElement('a');
    link.download = 'poster.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div 
        ref={editorRef}
        className="col-span-9 bg-gray-900 rounded-lg p-4 min-h-[600px] relative neon-border"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {selectedTemplate ? (
          <div className="relative w-full h-full">
            <img
              src={templates.find(t => t.id === selectedTemplate)?.thumbnail}
              alt="Selected template"
              className="w-full h-full object-contain opacity-20"
            />
            {textElements.map(element => (
              <div
                key={element.id}
                className={`absolute cursor-move ${
                  selectedElement === element.id ? 'ring-2 ring-cyan-400' : ''
                }`}
                style={{
                  left: element.position.x,
                  top: element.position.y
                }}
                onClick={() => handleElementClick(element.id)}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onDoubleClick={() => {
                  const newContent = prompt('Edit text:', element.content);
                  if (newContent) handleTextEdit(element.id, newContent);
                }}
              >
                <div style={{
                  color: element.style.color,
                  fontSize: `${element.style.fontSize}px`,
                  fontFamily: element.style.fontFamily,
                  fontWeight: element.style.fontWeight,
                  textAlign: element.style.textAlign
                }}>
                  {element.content}
                </div>
              </div>
            ))}
            {imageElements.map(element => (
              <div
                key={element.id}
                className={`absolute cursor-move ${
                  selectedElement === element.id ? 'ring-2 ring-cyan-400' : ''
                }`}
                style={{
                  left: element.position.x,
                  top: element.position.y
                }}
                onClick={() => handleElementClick(element.id)}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
              >
                <img
                  src={element.url}
                  alt="Uploaded element"
                  style={{
                    width: element.size.width,
                    height: element.size.height
                  }}
                  
                  className="object-contain"
                />
                {element.isCropping && (
                  <div className="absolute inset-0 border-2 border-cyan-400 bg-cyan-400/10" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-20">
            <Layout className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            <h3 className="text-lg font-medium text-cyan-400 mb-2 neon-text">
              Choose a Template to Start
            </h3>
            <p className="text-gray-400">
              Select from our professional templates or start from scratch
            </p>
          </div>
        )}
      </div>

      <div className="col-span-3">
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg neon-border space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Templates</h3>
            <div className="grid grid-cols-2 gap-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      : 'border-gray-700 hover:border-cyan-400/50'
                  }`}
                >
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {selectedElement && selectedElement.startsWith('text') && (
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Text Style</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Font Family
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-cyan-400"
                    value={textElements.find(el => el.id === selectedElement)?.style.fontFamily}
                    onChange={(e) => updateTextStyle(selectedElement, 'fontFamily', e.target.value)}
                  >
                    {fontFamilies.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Font Size
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-cyan-400"
                    value={textElements.find(el => el.id === selectedElement)?.style.fontSize}
                    onChange={(e) => updateTextStyle(selectedElement, 'fontSize', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Color
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                          textElements.find(el => el.id === selectedElement)?.style.color === color
                            ? 'border-cyan-400 scale-110'
                            : 'border-gray-600 hover:border-cyan-400/50'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateTextStyle(selectedElement, 'color', color)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Text Align
                  </label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map(align => (
                      <button
                        key={align}
                        className={`btn-secondary flex-1 ${
                          textElements.find(el => el.id === selectedElement)?.style.textAlign === align
                            ? 'bg-cyan-400/20'
                            : ''
                        }`}
                        onClick={() => updateTextStyle(selectedElement, 'textAlign', align)}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedElement && selectedElement.startsWith('image') && (
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Image Options</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Width"
                      className="px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-cyan-400"
                      value={imageElements.find(el => el.id === selectedElement)?.size.width}
                      onChange={(e) => {
                        const element = imageElements.find(el => el.id === selectedElement);
                        if (element) {
                          handleImageResize(selectedElement, Number(e.target.value), element.size.height);
                        }
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Height"
                      className="px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-cyan-400"
                      value={imageElements.find(el => el.id === selectedElement)?.size.height}
                      onChange={(e) => {
                        const element = imageElements.find(el => el.id === selectedElement);
                        if (element) {
                          handleImageResize(selectedElement, element.size.width, Number(e.target.value));
                        }
                      }}
                    />
                  </div>
                </div>
                <button
                  className="btn-secondary w-full"
                  onClick={() => toggleImageCrop(selectedElement)}
                >
                  <Crop className="w-4 h-4 mr-2" />
                  Toggle Crop
                </button>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Add Elements</h3>
            <div className="space-y-2">
              <button 
                className="btn-secondary w-full"
                onClick={() => addTextElement('heading')}
              >
                <Type className="w-4 h-4 mr-2" />
                Add Heading
              </button>
              <button 
                className="btn-secondary w-full"
                onClick={() => addTextElement('subheading')}
              >
                <Type className="w-4 h-4 mr-2" />
                Add Subheading
              </button>
              <button 
                className="btn-secondary w-full"
                onClick={() => addTextElement('body')}
              >
                <Type className="w-4 h-4 mr-2" />
                Add Body Text
              </button>
              <button 
                className="btn-secondary w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Add Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <button 
              className="btn-primary w-full"
              disabled={!selectedTemplate}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Design
            </button>
            <button 
              className="btn-secondary w-full"
              onClick={handleDownload}
              disabled={!selectedTemplate}
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

export default PosterEditor;