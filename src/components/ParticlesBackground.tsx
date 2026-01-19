import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse for subtle interaction
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create particles - fewer but more prominent
    const particleCount = 25;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.3, // Slower movement
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() > 0.5 ? 180 : 270, // Cyan or Violet
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Slow floating movement
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Subtle mouse attraction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200) {
          particle.x += dx * 0.001;
          particle.y += dy * 0.001;
        }

        // Wrap around edges with smooth transition
        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;

        // Pulsing glow effect
        particle.pulse += particle.pulseSpeed;
        const pulseOpacity = particle.opacity * (0.7 + 0.3 * Math.sin(particle.pulse));

        // Draw particle with multi-layer glow
        const color = particle.hue === 180 
          ? `rgba(0, 245, 255, ${pulseOpacity})`
          : `rgba(168, 85, 247, ${pulseOpacity})`;

        // Outer glow
        ctx.beginPath();
        const outerGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 15
        );
        outerGradient.addColorStop(0, color);
        outerGradient.addColorStop(0.4, particle.hue === 180 
          ? `rgba(0, 245, 255, ${pulseOpacity * 0.3})`
          : `rgba(168, 85, 247, ${pulseOpacity * 0.3})`);
        outerGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = outerGradient;
        ctx.arc(particle.x, particle.y, particle.size * 15, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.beginPath();
        const innerGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        innerGradient.addColorStop(0, `rgba(255, 255, 255, ${pulseOpacity * 0.8})`);
        innerGradient.addColorStop(0.5, color);
        innerGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = innerGradient;
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw subtle connecting lines between nearby particles
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 245, 255, ${0.03 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particles-container"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ParticlesBackground;
