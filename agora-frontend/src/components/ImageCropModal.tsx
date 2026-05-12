import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

interface ImageCropModalProps {
  imageSrc: string;
  aspect?: number;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas is empty'));
    }, 'image/jpeg', 0.9);
  });
}

const ImageCropModal = ({ imageSrc, aspect = 16 / 9, onConfirm, onCancel }: ImageCropModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch {
      // ignore
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[var(--agora-panel)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[var(--agora-border)]">
          <h3 className="text-base font-bold text-[var(--agora-ink)]">Recortar imagem</h3>
          <button onClick={onCancel} className="text-[var(--agora-muted)] hover:text-[var(--agora-ink)]">✕</button>
        </div>

        <div className="relative h-72 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="p-5">
          <label className="block text-xs font-semibold text-[var(--agora-ink)] mb-2">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="w-full accent-[var(--agora-accent)]"
          />
          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-[var(--agora-border)] rounded-lg text-sm text-[var(--agora-muted)] hover:text-[var(--agora-ink)]"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-5 py-2 bg-[var(--agora-accent)] hover:bg-[var(--agora-accent-hover)] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {isProcessing ? 'Processando...' : 'Aplicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
