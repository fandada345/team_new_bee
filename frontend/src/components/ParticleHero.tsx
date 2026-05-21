import { useRef, useEffect } from 'react';

export function ParticleHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Simple canvas-based particle text effect (safer than Three.js)
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // ctx is guaranteed non-null below

    const dpr = Math.min(window.devicePixelRatio, 2);
    const rect = container.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Sample text to get particle positions
    const offscreen = document.createElement('canvas');
    offscreen.width = 1200;
    offscreen.height = 300;
    const offCtx = offscreen.getContext('2d')!;
    offCtx.fillStyle = 'black';
    offCtx.fillRect(0, 0, offscreen.width, offscreen.height);
    offCtx.fillStyle = 'white';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.font = 'bold 180px Inter, -apple-system, sans-serif';
    offCtx.fillText('INSIGHT', offscreen.width / 2, offscreen.height / 2);

    const imgData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;
    const particles: { x: number; y: number; baseX: number; baseY: number; z: number; phase: number }[] = [];
    const step = 6;

    for (let y = 0; y < offscreen.height; y += step) {
      for (let x = 0; x < offscreen.width; x += step) {
        const idx = (y * offscreen.width + x) * 4;
        if (imgData[idx] > 128) {
          const px = (x / offscreen.width) * w;
          const py = (y / offscreen.height) * h;
          particles.push({
            x: px,
            y: py,
            baseX: px,
            baseY: py,
            z: Math.random() * 100,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    if (particles.length === 0) return;

    let mouseX = -1000;
    let mouseY = -1000;
    let animationId = 0;
    let time = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect2 = container.getBoundingClientRect();
      mouseX = e.clientX - rect2.left;
      mouseY = e.clientY - rect2.top;
    };
    const onMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    function animate() {
      animationId = requestAnimationFrame(animate);
      time += 0.016;
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        // Entrance animation - z goes from initial to 0
        const entranceProgress = Math.min(time / 1.5, 1);
        const easeOut = 1 - Math.pow(1 - entranceProgress, 3);
        const currentZ = p.z * (1 - easeOut);

        // Mouse repulsion
        const dx = p.baseX - mouseX;
        const dy = p.baseY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / 100);

        const repelX = dx * influence * 0.3;
        const repelY = dy * influence * 0.3;

        // Gentle floating
        const floatX = Math.cos(time * 0.8 + p.phase) * 1;
        const floatY = Math.sin(time * 1.2 + p.phase * 0.7) * 0.8;

        const finalX = p.baseX + repelX + floatX;
        const finalY = p.baseY + repelY + floatY;
        const finalAlpha = 0.4 + 0.6 * (1 - currentZ / 100) * (1 - influence * 0.3);

        const size = 1.5 + (1 - currentZ / 100) * 0.5;

        ctx.beginPath();
        ctx.arc(finalX, finalY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha * 0.7})`;
        ctx.fill();
      }
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '30vh',
        minHeight: '200px',
        overflow: 'hidden',
        background: 'var(--canvas)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="particle-hero-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1
          className="font-geist"
          style={{
            fontSize: 'clamp(40px, 8vw, 80px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            opacity: 0.08,
          }}
        >
          INSIGHT
        </h1>
      </div>
    </div>
  );
}
