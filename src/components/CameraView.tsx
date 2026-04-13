import { useRef, useEffect, useState, useCallback } from 'react';
import { FlipVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface CameraViewProps {
  onCapture: (photoBase64: string, status: string) => void;
  title: string;
}

export function CameraView({ onCapture, title }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback or error handling
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          // Mirror the image for front camera
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(dataUrl);
      }
    }
  };

  const retake = () => {
    setPhoto(null);
  };

  const submit = () => {
    if (photo) {
      onCapture(photo, status || '此刻...');
    }
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative h-screen w-full bg-black text-white flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <h2 className="text-sm font-light tracking-widest uppercase">{title}</h2>
        {!photo && (
          <button onClick={flipCamera} className="p-3 glass rounded-full">
            <FlipVertical className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden bg-zinc-900">
        {!photo ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        ) : (
          <img src={photo} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-8 flex flex-col items-center bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <input
          type="text"
          placeholder="我在..."
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full max-w-[280px] bg-transparent border-b border-white/30 text-center text-xl font-handwriting text-white placeholder-white/50 focus:outline-none focus:border-white/80 transition-colors pb-2 mb-10"
          maxLength={20}
        />

        {!photo ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center relative"
          >
            <div className="w-16 h-16 bg-white rounded-full" />
          </motion.button>
        ) : (
          <div className="flex gap-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={retake}
              className="glass px-6 py-3 rounded-full text-sm font-medium tracking-wide flex items-center gap-2"
            >
              重拍
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={submit}
              className="bg-white text-black px-8 py-3 rounded-full text-sm font-medium tracking-wide flex items-center gap-2"
            >
              完成
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
