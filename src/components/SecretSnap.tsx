import React, { useState, useCallback, useRef, useEffect } from 'react';
import SenderPanel from './SenderPanel';
import EncryptedPanel from './EncryptedPanel';
import ReceiverPanel from './ReceiverPanel';
import BrandHeader from './BrandHeader';
import StepIndicator from './StepIndicator';
import ParticlesBackground from './ParticlesBackground';
import { encryptMessage } from '@/utils/encryption';
import { useToast } from '@/components/ui/use-toast';

type Step = 1 | 2 | 3;

const SecretSnap: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [encryptedMessage, setEncryptedMessage] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [ttl, setTtl] = useState<number>(30);
  const [secureLink, setSecureLink] = useState<string>('');
  const { toast } = useToast();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const selfDestructTimerRef = useRef<number | null>(null);

  const clearSelfDestructTimer = useCallback(() => {
    if (selfDestructTimerRef.current !== null) {
      window.clearTimeout(selfDestructTimerRef.current);
      selfDestructTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearSelfDestructTimer, [clearSelfDestructTimer]);

  const resetState = useCallback(() => {
    clearSelfDestructTimer();
    setEncryptedMessage('');
    setSecretKey('');
    setSecureLink('');
    setCurrentStep(1);
  }, [clearSelfDestructTimer]);

  const handleSendMessage = async (message: string, messageTtl: number, key: string) => {
    clearSelfDestructTimer();
    const encrypted = await encryptMessage(message, key);
    setEncryptedMessage(encrypted);
    setSecretKey(key);
    setTtl(messageTtl);
    const link = `${window.location.origin}/decrypt/${encodeURIComponent(encrypted.slice(-20))}`;
    setSecureLink(link);
    setCurrentStep(2);
    toast({ description: "Message encrypted with AES-256-GCM!" });
  };

  const handleGenerateLink = () => {
    if (encryptedMessage && secretKey) {
      const link = `${window.location.origin}/decrypt/${encodeURIComponent(encryptedMessage.slice(-20))}`;
      setSecureLink(link);
      navigator.clipboard.writeText(link).then(() => {
        toast({ description: "Secure link copied to clipboard!" });
      });
    }
  };

  const handleDecrypt = useCallback((_decryptedMessage: string, isCorrect: boolean) => {
    if (isCorrect) {
      setCurrentStep(3);
      toast({ description: "Message decrypted successfully!" });
      clearSelfDestructTimer();
      selfDestructTimerRef.current = window.setTimeout(() => resetState(), ttl * 1000);
    } else {
      toast({ description: "Message decrypted." });
    }
  }, [ttl, toast, clearSelfDestructTimer, resetState]);

  const handleExpire = () => {
    resetState();
    toast({ description: "Message has expired and been destroyed." });
  };

  const handleNextStep = () => {
    if (currentStep < 3) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  // Mobile swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    } else if (distance < -minSwipeDistance && currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <ParticlesBackground />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        <BrandHeader />

        <div className="max-w-2xl mx-auto">
          <StepIndicator currentStep={currentStep} totalSteps={3} />

          <div
            className="glass-card p-6 md:p-10 min-h-[550px]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {currentStep === 1 && (
              <div className="slide-in h-full">
                <SenderPanel onSendMessage={handleSendMessage} onNext={handleNextStep} />
              </div>
            )}

            {currentStep === 2 && (
              <div className="slide-in h-full">
                <EncryptedPanel
                  encryptedMessage={encryptedMessage}
                  secretKey={secretKey}
                  secureLink={secureLink}
                  ttl={ttl}
                  onExpire={handleExpire}
                  onGenerateLink={handleGenerateLink}
                  onBack={handlePrevStep}
                  onTestDecrypt={() => setCurrentStep(3)}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="slide-in h-full">
                <ReceiverPanel
                  encryptedMessage={encryptedMessage}
                  ttl={ttl}
                  onDecrypt={handleDecrypt}
                  onBack={handlePrevStep}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">
              Built with zero-knowledge encryption. Your messages never touch our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretSnap;
