import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Lock, RefreshCw, Check, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateSecretKey } from '@/utils/encryption';

interface SenderPanelProps {
  onSendMessage: (message: string, ttl: number, secretKey: string) => void;
  onNext?: () => void;
}

const SenderPanel: React.FC<SenderPanelProps> = ({ onSendMessage, onNext }) => {
  const [message, setMessage] = useState<string>('');
  const [ttl, setTtl] = useState<number>(30);
  const [secretKey, setSecretKey] = useState<string>('');
  const [keyCopied, setKeyCopied] = useState<boolean>(false);
  const [keyMasked, setKeyMasked] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const { toast } = useToast();
  const timerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!secretKey) {
      setSecretKey(generateSecretKey());
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({ title: "Error", description: "Please enter a message", variant: "destructive" });
      return;
    }
    if (!secretKey.trim()) {
      toast({ title: "Error", description: "Please generate a secret key", variant: "destructive" });
      return;
    }
    onSendMessage(message, ttl, secretKey);
  };

  const generateNewKey = () => {
    setSecretKey(generateSecretKey());
    toast({ description: "New secret key generated" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
      toast({ description: "Secret key copied to clipboard" });
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  // Radial timer calculation
  const circumference = 2 * Math.PI * 52;
  const progress = (ttl / 300) * 100;
  const offset = circumference - (progress / 100) * circumference;

  // Handle radial drag
  const handleTimerInteraction = useCallback(
    (e: { clientX: number; clientY: number } | React.MouseEvent | React.TouchEvent) => {
      if (!timerRef.current) return;
      const rect = timerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let clientX: number;
      let clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const angle = Math.atan2(clientY - centerY, clientX - centerX);
      let normalizedAngle = (angle + Math.PI / 2) / (2 * Math.PI);
      if (normalizedAngle < 0) normalizedAngle += 1;
      if (normalizedAngle > 1) normalizedAngle -= 1;

      const newTtl = Math.round((normalizedAngle * 295 + 5) / 5) * 5;
      setTtl(Math.max(5, Math.min(300, newTtl)));
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleTimerInteraction(e);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && timerRef.current) {
      handleTimerInteraction(e);
    }
  }, [isDragging, handleTimerInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold mb-3 bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
          Compose Message
        </h2>
        <p className="text-slate-400 text-sm md:text-base">
          Create your encrypted message. It will self-destruct after viewing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-grow gap-6">
        {/* Message Textarea */}
        <div className="floating-input">
          <textarea
            id="message"
            className="min-h-[130px] resize-none"
            placeholder=" "
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <label htmlFor="message">Your Secret Message</label>
        </div>

        {/* Radial Timer Selector */}
        <div className="flex flex-col items-center py-4">
          <label className="block text-sm font-medium text-slate-300 mb-4">
            Self-Destruct Timer
          </label>
          <div 
            ref={timerRef}
            className="relative w-36 h-36 cursor-pointer select-none"
            onMouseDown={handleMouseDown}
          >
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f5ff" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-150"
                style={{ filter: 'drop-shadow(0 0 12px rgba(0, 245, 255, 0.6))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white font-mono">{formatTime(ttl)}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">until destruct</span>
            </div>
          </div>
          
          {/* Quick Select Buttons */}
          <div className="flex gap-2 mt-4">
            {[15, 30, 60, 120, 300].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTtl(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  ttl === t 
                    ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30' 
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {formatTime(t)}
              </button>
            ))}
          </div>
        </div>

        {/* Secret Key Input */}
        <div className="floating-input">
          <div className="relative">
            <input
              id="secretKey"
              type={keyMasked ? 'password' : 'text'}
              className="secret-key-input pr-28"
              placeholder=" "
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
            />
            <label htmlFor="secretKey">Secret Key (Share with recipient)</label>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <button
                type="button"
                onClick={() => setKeyMasked(!keyMasked)}
                className="icon-button h-8 w-8"
                title={keyMasked ? "Show key" : "Hide key"}
              >
                {keyMasked ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                type="button"
                onClick={generateNewKey}
                className="icon-button h-8 w-8"
                title="Generate new key"
              >
                <RefreshCw size={14} />
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(secretKey)}
                className={`icon-button h-8 w-8 ${keyCopied ? 'text-cyan-400 border-cyan-400/30' : ''}`}
                disabled={!secretKey.trim()}
                title="Copy key"
              >
                {keyCopied ? <Check size={14} className="copy-confirm" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-auto pt-4">
          <Button
            type="submit"
            className="neon-button neon-button-pulse w-full text-lg py-6 gap-3"
            disabled={!message.trim() || !secretKey.trim()}
          >
            <Lock size={20} />
            Encrypt & Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SenderPanel;
