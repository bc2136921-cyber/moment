import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CameraView } from '../components/CameraView';
import { p2pBackend } from '../utils/p2pBackend';
import { Loader2 } from 'lucide-react';

export function Join() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
    }
  }, [roomId, navigate]);

  const handleCapture = async (photo: string, status: string) => {
    if (roomId) {
      setIsJoining(true);
      try {
        await p2pBackend.joinRoom(roomId, photo, status);
        navigate(`/result/${roomId}`);
      } catch (err) {
        console.error(err);
        alert('加入失败，对方可能已离开或网络不稳定');
        navigate('/');
      } finally {
        setIsJoining(false);
      }
    }
  };

  if (isJoining) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-white/50 mb-4" />
        <p className="text-sm font-light tracking-wide text-white/70">正在发送时刻给对方...</p>
      </div>
    );
  }

  return <CameraView onCapture={handleCapture} title="Join Moment" />;
}
