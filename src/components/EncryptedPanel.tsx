import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Timer, Share2, ArrowLeft, Check, Link2, MessageSquare, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface EncryptedPanelProps {
  encryptedMessage: string;
  secretKey: string;
  secureLink: string;
  ttl: number;
  onExpire: () => void;
  onGenerateLink: () => void;
  onBack?: () => void;
  onTestDecrypt?: () => void;
}

const EncryptedPanel: React.FC<EncryptedPanelProps> = ({
  encryptedMessage,
  secretKey,
  secureLink,
  ttl,
  onExpire,
  onGenerateLink,
  onBack,
  onTestDecrypt
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(ttl);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [keyCopied, setKeyCopied] = useState<boolean>(false);
  const [messageCopied, setMessageCopied] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!encryptedMessage) return;
    setTimeLeft(ttl);
    setIsActive(true);

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsActive(false);
          onExpire();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [encryptedMessage, ttl, onExpire]);

  const copyToClipboard = (text: string, type: 'link' | 'key' | 'message') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'link') { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }
      if (type === 'key') { setKeyCopied(true); setTimeout(() => setKeyCopied(false), 2000); }
      if (type === 'message') { setMessageCopied(true); setTimeout(() => setMessageCopied(false), 2000); }
      toast({ description: `${type === 'link' ? 'Secure link' : type === 'key' ? 'Secret key' : 'Encrypted message'} copied!` });
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const circumference = 2 * Math.PI * 52;
  const progress = (timeLeft / ttl) * 100;
  const offset = circumference - (progress / 100) * circumference;

  if (!encryptedMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="text-center text-slate-400">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-400/10 to-violet-400/10 flex items-center justify-center">
            <Timer size={40} className="text-cyan-400/50" />
          </div>
          <p className="text-lg">Waiting for message to be encrypted...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4 w-fit text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/5">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
      )}

      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold mb-3 bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
          Encrypt & Generate Link
        </h2>
        <p className="text-slate-400 text-sm md:text-base">
          Your message is encrypted. Share the link and key through separate channels.
        </p>
      </div>

      {isActive ? (
        <div className="flex flex-col gap-6">
          {/* Countdown Timer */}
          <div className="flex justify-center mb-2">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="countdownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#00f5ff" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="url(#countdownGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000"
                  style={{ filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.6))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Timer size={20} className="text-violet-400 mb-1" />
                <span className="text-xl font-bold text-white font-mono">{formatTime(timeLeft)}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">remaining</span>
              </div>
            </div>
          </div>

          {/* Encrypted Message */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-300 mb-2">
              <span>Encrypted Message</span>
              <button
                onClick={() => copyToClipboard(encryptedMessage, 'message')}
                className={`icon-button h-7 w-7 ${messageCopied ? 'text-cyan-400 border-cyan-400/30' : ''}`}
              >
                {messageCopied ? <Check size={12} className="copy-confirm" /> : <Copy size={12} />}
              </button>
            </label>
            <div className="encrypted-text max-h-24 overflow-y-auto">
              {encryptedMessage}
            </div>
          </div>

          {/* Secret Key */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-300 mb-2">
              <span>Secret Key</span>
              <button
                onClick={() => copyToClipboard(secretKey, 'key')}
                className={`icon-button h-7 w-7 ${keyCopied ? 'text-cyan-400 border-cyan-400/30' : ''}`}
              >
                {keyCopied ? <Check size={12} className="copy-confirm" /> : <Copy size={12} />}
              </button>
            </label>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm text-slate-300 tracking-wider">
              {secretKey}
            </div>
          </div>

          {/* Generate & Share Link */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Secure Link</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 font-mono text-xs text-slate-400 break-all overflow-hidden">
                {secureLink || 'Click Generate to create link'}
              </div>
              <Button
                onClick={onGenerateLink}
                className="bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/30 text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-400/10"
              >
                <Link2 size={16} className="mr-2" />
                Generate
              </Button>
            </div>
            
            {secureLink && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="text-xs text-slate-500">Share via:</span>
                <button onClick={() => copyToClipboard(secureLink, 'link')} className={`share-button ${linkCopied ? 'text-cyan-400 border-cyan-400/30' : ''}`} title="Copy Link">
                  {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button className="share-button" title="Share via Message" onClick={() => window.open(`sms:?body=${encodeURIComponent(secureLink)}`)}>
                  <MessageSquare size={16} />
                </button>
                <button className="share-button" title="Share via Email" onClick={() => window.open(`mailto:?subject=Secure Message&body=${encodeURIComponent(`Your secure message: ${secureLink}\n\nYou'll need the secret key to decrypt it.`)}`)}>
                  <Mail size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-gradient-to-r from-cyan-400/5 to-violet-400/5 border border-white/5 rounded-xl p-4 mt-auto">
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-cyan-400 font-semibold"> Security Tip:</span> Share the secret key through a different channel than the link. The message will self-destruct after viewing or when the timer expires.
            </p>
          </div>

          {/* Test Decrypt Button */}
          {onTestDecrypt && (
            <Button
              onClick={onTestDecrypt}
              className="w-full mt-4 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-400/30 text-violet-300 hover:border-violet-400/50 hover:bg-violet-400/10 py-5 gap-2"
            >
              <Share2 size={18} />
              Go to Decrypt View (Step 3)
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          <div className="text-center text-slate-400">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-400/10 to-slate-400/10 flex items-center justify-center">
              <Timer size={40} className="text-violet-400/50" />
            </div>
            <p className="text-lg">This message has expired or been viewed.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncryptedPanel;
