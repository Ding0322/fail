import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { uploadTravelPhoto } from '../firebase';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  onImageRemoved?: () => void;
  label?: string;
  aspect?: 'square' | 'video' | 'wide';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  currentImage,
  onImageRemoved,
  label = '上傳照片 (支援自動壓縮與即時預覽)',
  aspect = 'video'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案 (JPG, PNG, WebP)');
      return;
    }

    try {
      setIsUploading(true);
      const photoUrl = await uploadTravelPhoto(file);
      onImageUploaded(photoUrl);
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('圖片處理失敗，請重試');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const aspectClass = aspect === 'square' 
    ? 'aspect-square max-w-[200px]' 
    : aspect === 'wide' 
      ? 'aspect-[21/9]' 
      : 'aspect-[16/9]';

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-[#6D6257] mb-1.5">{label}</label>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {currentImage ? (
        <div className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden border-2 border-[#E0DACB] ac-shadow-sm group bg-[#FAF8F3]`}>
          <img
            src={currentImage}
            alt="Preview"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-[#4A4036] text-xs font-bold rounded-xl active:scale-95 transition-transform"
            >
              替換照片
            </button>
            {onImageRemoved && (
              <button
                type="button"
                onClick={onImageRemoved}
                className="p-1.5 bg-[#E88873] text-white rounded-xl active:scale-95 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full ${aspectClass} rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center ${
            dragOver 
              ? 'border-[#5C8984] bg-[#F0F5F4]' 
              : 'border-[#D9D3C3] bg-[#FAF8F2] hover:bg-[#F4EFE5]'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-[#5C8984]">
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="text-xs font-bold">正在壓縮與上傳圖片...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[#8A7E72]">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#E0DACB] flex items-center justify-center text-[#5C8984] ac-shadow-sm">
                <Camera className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#5A5046]">點擊或拖曳照片至此</p>
              <p className="text-[10px] text-[#A69B8E]">支援 JPG、PNG、WebP (自動優化體積)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
