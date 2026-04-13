import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraView } from '../components/CameraView';
import { p2pBackend } from '../utils/p2pBackend';
import { Loader2 } from 'lucide-react';

export function Create() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCapture = async (photo: string, status: string) => {
    setIsCreating(true);
    try {
      const roomId = await p2pBackend.createRoom(photo, status);
      navigate(`/wait/${roomId}`);
    } catch (err) {
      console.error("Failed to create room:", err);
      alert("创建房间失败，请重试");
    } finally {
      setIsCreating(false);
    }
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-white/50 mb-4" />
        <p className="text-sm font-light tracking-wide text-white/70">正在为您生成专属时刻链接...</p>
      </div>
    );
  }

  return <CameraView onCapture={handleCapture} title="Your Moment" />;
}
