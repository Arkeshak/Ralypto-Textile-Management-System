import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface PhotoUploadZoneProps {
  personImage: string | null;
  onImageSelected: (base64OrUrl: string) => void;
  onClearImage: () => void;
  consentConfirmed: boolean;
  onConsentChange: (confirmed: boolean) => void;
}

const SAMPLE_MODELS = [
  {
    name: 'Model 1 (Full length)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Model 2 (Editorial)',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Model 3 (Studio)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
  },
];

export const PhotoUploadZone: React.FC<PhotoUploadZoneProps> = ({
  personImage,
  onImageSelected,
  onClearImage,
  consentConfirmed,
  onConsentChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported format. Please upload a JPEG, PNG, or WEBP image.');
      return;
    }

    // Validate size (max 12MB)
    if (file.size > 12 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 12MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelected(result);
      onConsentChange(true);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {personImage ? (
        /* Image Preview Box */
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 group aspect-3/4 max-w-sm mx-auto">
          <img src={personImage} alt="Uploaded Person" className="w-full h-full object-cover" />

          {/* Overlay controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white font-bold text-[11px] backdrop-blur-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Photo Ready</span>
              </span>

              <button
                type="button"
                onClick={onClearImage}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-600 text-white shadow-md transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-white text-xs space-y-0.5">
              <div className="font-bold">Customer Photo Attached</div>
              <div className="text-slate-300 text-[10px]">
                Ready for virtual try-on with selected dress.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-blue-600 bg-blue-50/60 ring-4 ring-blue-500/20'
              : 'border-slate-300 hover:border-blue-500 bg-slate-50/80 hover:bg-white'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
            <Upload className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-bold text-slate-800">
              Upload your photo or drag & drop here
            </div>
            <div className="text-xs text-slate-400">
              Supports JPEG, PNG, WEBP (up to 12MB)
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 hover:bg-slate-50">
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              <span>Take Photo / Choose Library</span>
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      )}

      {/* Preset Demo Models for instant testing without uploading personal files */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
        <div className="font-bold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Preset models (or upload above):</span>
          </span>
          {SAMPLE_MODELS.some((m) => m.url === personImage) && (
            <span className="text-[10px] text-blue-600 font-semibold">Demo model active</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_MODELS.map((m, idx) => {
            const isSelected = personImage === m.url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onImageSelected(m.url);
                  onConsentChange(true);
                }}
                className={`group relative aspect-square rounded-xl overflow-hidden border transition-all ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500 shadow-xs'
                    : 'border-slate-200 hover:border-blue-400 shadow-2xs'
                }`}
              >
                <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div
                  className={`absolute inset-0 flex items-center justify-center font-bold text-[10px] transition-opacity ${
                    isSelected
                      ? 'bg-blue-900/60 text-white opacity-100'
                      : 'bg-slate-900/40 text-white opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {isSelected ? '✓ Selected' : 'Use Model'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo Suitability Guidelines */}
      <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 text-[11px] text-slate-600 space-y-1.5">
        <div className="font-bold text-blue-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Tips for Best Virtual Try-On Results</span>
        </div>
        <ul className="list-disc list-inside space-y-0.5 text-slate-600">
          <li>Stand straight facing the camera with arms slightly away from hips.</li>
          <li>Ensure good ambient lighting without harsh shadows.</li>
          <li>Wear fitted clothing (e.g. leggings or t-shirt) for natural garment drape.</li>
        </ul>
      </div>

      {/* Mandatory Consent Checkbox */}
      <label className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
        <input
          type="checkbox"
          checked={consentConfirmed}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
        />
        <span className="text-xs text-slate-700 leading-tight">
          <span className="font-bold text-slate-900 block mb-0.5">Photo Permission & Consent Confirmation</span>
          I confirm that I have permission to upload this photo for AI virtual try-on processing. Photos are privately processed and can be permanently deleted at any time.
        </span>
      </label>
    </div>
  );
};
