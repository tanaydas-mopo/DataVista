import { useEffect, useRef } from "react";

interface Sphere {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  speedX: number;
  speedY: number;
  phaseX: number;
  phaseY: number;
  colorType: "blue" | "cyan" | "purple" | "white";
  depth: number; // for 3D scale & parallax depth
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  driftX: number;
  opacity: number;
  maxOpacity: number;
  pulsePhase: number;
}

export function ThreeDAbstractBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    // Detect dark mode from document root
    const isDark = () =>
      document.documentElement.classList.contains("dark") ||
      document.documentElement.classList.contains("extra-dark") ||
      document.documentElement.classList.contains("cobalt-dark");

    // Initialize 3D Organic Floating Spheres
    const spheres: Sphere[] = [
      {
        x: width * 0.2,
        y: height * 0.25,
        baseX: width * 0.2,
        baseY: height * 0.25,
        radius: 120,
        speedX: 0.0008,
        speedY: 0.0006,
        phaseX: 0,
        phaseY: 1.2,
        colorType: "blue",
        depth: 1.2,
      },
      {
        x: width * 0.8,
        y: height * 0.3,
        baseX: width * 0.8,
        baseY: height * 0.3,
        radius: 150,
        speedX: 0.0005,
        speedY: 0.0007,
        phaseX: 2.1,
        phaseY: 0.5,
        colorType: "cyan",
        depth: 0.8,
      },
      {
        x: width * 0.15,
        y: height * 0.75,
        baseX: width * 0.15,
        baseY: height * 0.75,
        radius: 100,
        speedX: 0.0009,
        speedY: 0.0005,
        phaseX: 1.5,
        phaseY: 3.1,
        colorType: "purple",
        depth: 1.4,
      },
      {
        x: width * 0.85,
        y: height * 0.8,
        baseX: width * 0.85,
        baseY: height * 0.8,
        radius: 130,
        speedX: 0.0006,
        speedY: 0.0008,
        phaseX: 3.5,
        phaseY: 2.0,
        colorType: "blue",
        depth: 1.0,
      },
      {
        x: width * 0.5,
        y: height * 0.15,
        baseX: width * 0.5,
        baseY: height * 0.15,
        radius: 80,
        speedX: 0.0007,
        speedY: 0.0009,
        phaseX: 0.8,
        phaseY: 4.0,
        colorType: "white",
        depth: 1.6,
      },
      {
        x: width * 0.48,
        y: height * 0.85,
        baseX: width * 0.48,
        baseY: height * 0.85,
        radius: 95,
        speedX: 0.0008,
        speedY: 0.0006,
        phaseX: 4.2,
        phaseY: 1.8,
        colorType: "cyan",
        depth: 1.1,
      },
    ];

    // Initialize Gentle Upward Drifting Data Particles
    const particleCount = 45;
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      speedY: Math.random() * 0.6 + 0.3,
      driftX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2,
      maxOpacity: Math.random() * 0.6 + 0.3,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      // Reposition base centers proportionally
      spheres[0].baseX = width * 0.2;
      spheres[0].baseY = height * 0.25;
      spheres[1].baseX = width * 0.8;
      spheres[1].baseY = height * 0.3;
      spheres[2].baseX = width * 0.15;
      spheres[2].baseY = height * 0.75;
      spheres[3].baseX = width * 0.85;
      spheres[3].baseY = height * 0.8;
      spheres[4].baseX = width * 0.5;
      spheres[4].baseY = height * 0.15;
      spheres[5].baseX = width * 0.48;
      spheres[5].baseY = height * 0.85;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.03;
      targetMouseY = (e.clientY - height / 2) * 0.03;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const dark = isDark();

      // Render Floating 3D Organic Spheres
      spheres.forEach((s) => {
        // Organic floating wave calculation
        const floatX = Math.sin(time * s.speedX + s.phaseX) * 45;
        const floatY = Math.cos(time * s.speedY + s.phaseY) * 35;
        const parallaxX = mouseX * s.depth;
        const parallaxY = mouseY * s.depth;

        s.x = s.baseX + floatX + parallaxX;
        s.y = s.baseY + floatY + parallaxY;

        // Dynamic 3D depth pulsing
        const scalePulse = 1 + Math.sin(time * 0.0015 + s.phaseX) * 0.08;
        const r = s.radius * scalePulse;

        // Gradient color stop configurations
        let grad;
        const highlightX = s.x - r * 0.35;
        const highlightY = s.y - r * 0.35;

        grad = ctx.createRadialGradient(
          highlightX,
          highlightY,
          r * 0.05,
          s.x,
          s.y,
          r
        );

        if (dark) {
          if (s.colorType === "blue") {
            grad.addColorStop(0, "rgba(96, 165, 250, 0.45)");
            grad.addColorStop(0.4, "rgba(37, 99, 235, 0.22)");
            grad.addColorStop(1, "rgba(9, 9, 11, 0)");
          } else if (s.colorType === "cyan") {
            grad.addColorStop(0, "rgba(56, 189, 248, 0.4)");
            grad.addColorStop(0.4, "rgba(14, 165, 233, 0.18)");
            grad.addColorStop(1, "rgba(9, 9, 11, 0)");
          } else if (s.colorType === "purple") {
            grad.addColorStop(0, "rgba(167, 139, 250, 0.35)");
            grad.addColorStop(0.4, "rgba(124, 58, 237, 0.16)");
            grad.addColorStop(1, "rgba(9, 9, 11, 0)");
          } else {
            grad.addColorStop(0, "rgba(241, 245, 249, 0.3)");
            grad.addColorStop(0.4, "rgba(148, 163, 184, 0.12)");
            grad.addColorStop(1, "rgba(9, 9, 11, 0)");
          }
        } else {
          if (s.colorType === "blue") {
            grad.addColorStop(0, "rgba(147, 197, 253, 0.55)");
            grad.addColorStop(0.45, "rgba(37, 99, 235, 0.15)");
            grad.addColorStop(1, "rgba(248, 250, 252, 0)");
          } else if (s.colorType === "cyan") {
            grad.addColorStop(0, "rgba(186, 230, 253, 0.5)");
            grad.addColorStop(0.45, "rgba(6, 182, 212, 0.14)");
            grad.addColorStop(1, "rgba(248, 250, 252, 0)");
          } else if (s.colorType === "purple") {
            grad.addColorStop(0, "rgba(221, 214, 254, 0.45)");
            grad.addColorStop(0.45, "rgba(139, 92, 246, 0.12)");
            grad.addColorStop(1, "rgba(248, 250, 252, 0)");
          } else {
            grad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
            grad.addColorStop(0.45, "rgba(226, 232, 240, 0.3)");
            grad.addColorStop(1, "rgba(248, 250, 252, 0)");
          }
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Gentle Upward Drifting Data Particles
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += Math.sin(time * 0.02 + p.pulsePhase) * p.driftX;

        // Reset particle if it drifts above viewport top
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        const currentOpacity =
          p.maxOpacity * (0.6 + 0.4 * Math.sin(time * 0.03 + p.pulsePhase));

        ctx.fillStyle = dark
          ? `rgba(186, 230, 253, ${currentOpacity})`
          : `rgba(37, 99, 235, ${currentOpacity * 0.7})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
}
