import React from 'react';
import { Shield, Clock, ServerOff } from 'lucide-react';

const BrandHeader: React.FC = () => {
  return (
    <div className="text-center mb-12 slide-up">
      {/* Animated Brand Title */}
      <h1 className="text-5xl md:text-7xl font-bold mb-4 font-poppins tracking-tight">
        <span 
          className="inline-block bg-clip-text text-transparent"
          style={{ 
            backgroundImage: 'linear-gradient(135deg, #fff 0%, #00f5ff 40%, #a855f7 70%, #00f5ff 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 4s ease infinite',
            WebkitBackgroundClip: 'text',
          }}
        >
          Secret
        </span>
        <span 
          className="inline-block bg-clip-text text-transparent"
          style={{ 
            backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #00f5ff 50%, #a855f7 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 4s ease infinite',
            animationDelay: '0.5s',
            WebkitBackgroundClip: 'text',
          }}
        >
          Snap
        </span>
      </h1>
      
      {/* Tagline */}
      <p className="text-slate-400 text-lg md:text-xl font-inter font-light tracking-wide mb-8">
        Messages that disappear. <span className="text-cyan-400/80">Privacy that stays.</span>
      </p>
      
      {/* Security Badges */}
      <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
        <div className="security-badge group cursor-default">
          <Shield size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm text-slate-300 font-medium">AES-256 Encryption</span>
        </div>
        <div className="security-badge group cursor-default">
          <Clock size={18} className="text-violet-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm text-slate-300 font-medium">Auto-Delete Timer</span>
        </div>
        <div className="security-badge group cursor-default">
          <ServerOff size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm text-slate-300 font-medium">No Server Storage</span>
        </div>
      </div>
    </div>
  );
};

export default BrandHeader;
