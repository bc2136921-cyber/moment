import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Share2, Home, Shuffle } from 'lucide-react';
import { p2pBackend, Room } from '../utils/p2pBackend';
import { LAYOUTS, LayoutStyle, renderLayout } from '../utils/layouts';

export function Result() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('polaroid');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }
    const r = p2pBackend.getRoom(roomId);
    if (!r || r.status !== 'completed') {
      navigate('/');
      return;
    }
    setRoom(r);
  }, [roomId, navigate]);

  useEffect(() => {
    if (room) {
      setIsGenerating(true);
      generateCollage(room, layoutStyle).then(() => setIsGenerating(false));
    }
  }, [room, layoutStyle]);

  const toggleLayout = () => {
    const currentIndex = LAYOUTS.indexOf(layoutStyle);
    const nextIndex = (currentIndex + 1) % LAYOUTS.length;
    setLayoutStyle(LAYOUTS[nextIndex]);
  };

  const generateCollage = async (roomData: Room, style: LayoutStyle) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load both images
    const loadImg = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    if (!roomData.creatorPhoto || !roomData.joinerPhoto) return;

    const [img1, img2] = await Promise.all([
      loadImg(roomData.creatorPhoto),
      loadImg(roomData.joinerPhoto)
    ]);

    const t1 = roomData.creatorStatus || 'Thinking about you';
    const t2 = roomData.joinerStatus || 'Thinking about you';
    const time1 = roomData.createdAt || Date.now();
    const time2 = roomData.joinerCreatedAt || Date.now();

    try {
      await document.fonts.load('60px Caveat');
    } catch (e) {
      console.warn('Font not loaded', e);
    }

    renderLayout(canvas, ctx, img1, img2, t1, t2, time1, time2, style);

    setResultImage(canvas.toDataURL('image/jpeg', 0.9));
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `moment-${Date.now()}.jpg`;
    link.click();
  };

  if (!room || !resultImage) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-zinc-950 p-6 flex flex-col items-center justify-center relative"
    >
      <div className={`w-full max-w-sm aspect-[9/16] relative rounded-3xl overflow-hidden shadow-2xl mb-8 border border-white/10 ${isGenerating ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}>
        <img src={resultImage} alt="Collage" className="w-full h-full object-cover" />
      </div>

      <div className="flex gap-4 z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        >
          <Download className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLayout}
          className="glass w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
          title="切换排版"
        >
          <Shuffle className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Our Moment',
                text: 'Check out our Moment collage!',
                url: window.location.href,
              });
            } else {
              handleDownload();
            }
          }}
          className="glass w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
        >
          <Share2 className="w-6 h-6" />
        </motion.button>
      </div>

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 p-3 glass rounded-full text-white"
      >
        <Home className="w-5 h-5" />
      </button>

      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
