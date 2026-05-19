import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function VideoPlayer({ src, poster, className = "" }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const scrub = (clientX: number) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newTime = pos * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(pos * 100);
      setCurrentTime(newTime);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    scrub(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      scrub(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`relative group overflow-hidden bg-black ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        playsInline
      />

      {/* Center Play Button Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <button 
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#FF4D00] hover:border-[#FF4D00] transition-all duration-300 group/btn"
              id="center-play-button"
            >
              <Play fill="currentColor" size={32} className="ml-1 group-hover/btn:scale-110 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Bottom Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 20 }}
        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20"
      >
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          className="w-full h-1 bg-white/20 mb-4 cursor-pointer relative touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div 
            className="absolute h-full bg-[#FF4D00]" 
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute h-3 w-3 bg-[#FF4D00] rounded-full top-1/2 -translate-y-1/2 -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-[#FF4D00] transition-colors" id="play-pause-toggle">
              {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
            </button>
            
            <div className="text-[11px] font-mono tracking-tighter opacity-80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <button onClick={toggleMute} className="hover:text-[#FF4D00] transition-colors" id="mute-toggle">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          <button onClick={handleFullscreen} className="hover:text-[#FF4D00] transition-colors" id="fullscreen-toggle">
            <Maximize size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
