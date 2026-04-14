import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, CheckCircle2 } from 'lucide-react';
import { p2pBackend, Room } from '../utils/p2pBackend';

export function Wait() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    
    // Subscribe to changes (P2P connections)
    const unsubscribe = p2pBackend.subscribe(roomId, (updatedRoom: Room) => {
      if (updatedRoom.status === 'completed') {
        navigate(`/result/${roomId}`);
      }
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

  // Get the correct base URL depending on the environment
  const getBaseUrl = () => {
    // If we're running inside the Capacitor Android app (file:// protocol or similar)
    // we should use the public production URL so the link works for the other person
    if (window.location.protocol === 'file:' || window.location.hostname === 'localhost') {
      return 'https://moment-trae-app.loca.lt';
    }
    return window.location.origin;
  };

  const inviteLink = `${getBaseUrl()}/join/${roomId}`;

  const copyLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Moment - 加入我的时刻',
        text: '点击链接，与我同刻记录：',
        url: inviteLink,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-black text-white relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none" />
      
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mb-12 relative"
      >
        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150" />
        <div className="w-12 h-12 mx-auto rounded-full bg-white/20 border border-white/50 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white animate-ping" />
        </div>
      </motion.div>

      <h2 className="text-2xl font-light tracking-wide mb-2 z-10">
        等待对方加入
      </h2>
      <p className="text-white/50 font-light text-sm mb-12 z-10">
        分享给你的另一半
      </p>

      <div className="glass w-full max-w-sm rounded-2xl p-6 z-10 flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={copyLink}
          className="bg-white text-black px-8 py-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium tracking-wide w-full mb-4"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              已复制
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              分享邀请链接
            </>
          )}
        </motion.button>
        <p className="text-[10px] text-white/30 text-center">
          提示：使用了 P2P 直连通信。<br/>发给您的另一半（对方需在真实设备上打开），即可瞬间完成拼接，无需任何后端服务器。
        </p>
      </div>
    </motion.div>
  );
}
