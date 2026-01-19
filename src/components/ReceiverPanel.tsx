import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Unlock, Timer, ArrowLeft, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ReceiverPanelProps {
  encryptedMessage: string;
  correctKey: string;
  ttl: number;
  onDecrypt: (decryptedMessage: string, success: boolean) => void;
  onBack?: () => void;
}

const ReceiverPanel: React.FC<ReceiverPanelProps> = ({
  encryptedMessage,
  correctKey,
  ttl,
  onDecrypt,
  onBack
}) => {
  const [secretKey, setSecretKey] = useState<string>('');
  const [decryptedMessage, setDecryptedMessage] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(ttl);
  const [messageDecrypted, setMessageDecrypted] = useState<boolean>(false);
  const [keyVisible, setKeyVisible] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!messageDecrypted) return;
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setMessageDecrypted(false);
          setDecryptedMessage('');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [messageDecrypted]);

  const handleDecrypt = async () => {
    if (!secretKey.trim()) {
      toast({ title: "Error", description: "Please enter the secret key", variant: "destructive" });
      return;
    }

    setIsDecrypting(true);
    
    // Simulate decryption delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = secretKey === correctKey;
    onDecrypt(secretKey, success);

    if (success) {
      const { fromBase64 } = await import('@/utils/encryption');
      try {
        setDecryptedMessage(fromBase64(encryptedMessage));
      } catch (e) {
        setDecryptedMessage("Error decrypting message.");
      }
    } else {
      const { generateFakeDecryptedMessage } = await import('@/utils/encryption');
      setDecryptedMessage(generateFakeDecryptedMessage());
    }

    setMessageDecrypted(true);
    setTimeLeft(ttl);
    setIsDecrypting(false);
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
            <Unlock size={40} className="text-cyan-400/50" />
          </div>
          <p className="text-lg">Waiting for an encrypted message...</p>
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
        <h2 className="text-2xl md:text-3xl font-semibold mb-3 bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
          Decrypt Message
        </h2>
        <p className="text-slate-400 text-sm md:text-base">
          Enter the secret key to decrypt and view the secure message.
        </p>
      </div>

      {!messageDecrypted ? (
        <div className="flex flex-col flex-grow gap-6">
          {/* Security Indicator */}
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20">
              <ShieldCheck size={18} className="text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">End-to-End Encrypted</span>
            </div>
          </div>

          {/* Secret Key Input */}
          <div className="floating-input">
            <div className="relative">
              <input
                id="secretKey"
                type={keyVisible ? 'text' : 'password'}
                className="secret-key-input pr-14"
                placeholder=" "
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDecrypt()}
              />
              <label htmlFor="secretKey">Enter Secret Key</label>
              <button
                type="button"
                onClick={() => setKeyVisible(!keyVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 icon-button h-8 w-8"
              >
                {keyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Decrypt Button */}
          <div className="mt-auto pt-4">
            <Button
              onClick={handleDecrypt}
              className="neon-button w-full text-lg py-6 gap-3"
              disabled={!secretKey.trim() || isDecrypting}
            >
              {isDecrypting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Decrypting...
                </>
              ) : (
                <>
                  <Unlock size={20} />
                  Decrypt Message
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Countdown Timer */}
          <div className="flex justify-center mb-2">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="decryptGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f5ff" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="url(#decryptGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-1000"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 245, 255, 0.6))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-white font-mono">{formatTime(timeLeft)}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">auto-destruct</span>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-400/90">
              This message will self-destruct in {formatTime(timeLeft)}. Read carefully.
            </p>
          </div>

          {/* Decrypted Message */}
          <div className="flex-grow">
            <label className="block text-sm font-medium text-slate-300 mb-3">Decrypted Message</label>
            <div className="decrypted-message min-h-[180px]">
              <p className="whitespace-pre-wrap text-slate-200 leading-relaxed">
                {decryptedMessage}
              </p>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-auto pt-4">
            <Button
              onClick={() => {
                setSecretKey('');
                setMessageDecrypted(false);
                setDecryptedMessage('');
              }}
              className="w-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
            >
              Decrypt Another Message
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiverPanel;
