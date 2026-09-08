"use client";

import React, { useEffect, useRef } from "react";

export const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log("NeuralBackground: useEffect started");
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0,
      h = 0,
      cx = 0,
      cy = 0;
    let animationFrameId: number;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset before scaling
      ctx.scale(dpr, dpr);

      cx = w / 2;
      cy = h / 2;
    };

    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: cx, y: cy, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Node and Pulse Types
    interface Node {
      x: number;
      y: number;
      baseR: number;
      z: number;
      phase: number;
      connections: Node[];
    }

    class Pulse {
      a: Node;
      b: Node;
      t: number;
      speed: number;

      constructor(a: Node, b: Node) {
        this.a = a;
        this.b = b;
        this.t = 0;
        this.speed = 0.015 + Math.random() * 0.025;
      }

      update() {
        this.t += this.speed;
        return this.t >= 1;
      }

      draw(
        ctx: CanvasRenderingContext2D,
        mouse: { x: number; y: number; active: boolean }
      ) {
        const x = this.a.x + (this.b.x - this.a.x) * this.t;
        const y = this.a.y + (this.b.y - this.a.y) * this.t;
        const distToMouse = mouse.active
          ? Math.hypot(x - mouse.x, y - mouse.y)
          : 999;
        const glow = distToMouse < 200 ? 1.5 : 1;

        ctx.save();
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 20 * glow;

        // Pulse aura
        ctx.beginPath();
        ctx.arc(x, y, 5 * glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, 0.5)`;
        ctx.fill();

        // Pulse core
        ctx.beginPath();
        ctx.arc(x, y, 1.5 * glow, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.restore();
      }
    }

    // Volumetric Mesh Generation - Full Screen Neural Cloud
    const NODES: Node[] = [];
    const NODE_COUNT = 3800; // Even higher density for 4K-8K look

    for (let i = 0; i < NODE_COUNT; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;

      // Subtle topographic clustering so it's not perfectly uniform
      const nx = (x / w) * 12;
      const ny = (y / h) * 12;
      const fold = Math.sin(nx + Math.cos(ny)) + Math.cos(ny - Math.sin(nx));

      const simulatedZ = Math.max(0.1, 0.4 + fold * 0.3);

      NODES.push({
        x,
        y,
        baseR: 0.5 + Math.random() * 1.5,
        z: simulatedZ,
        phase: Math.random() * Math.PI * 2,
        connections: [],
      });
    }

    let time = 0;
    const animate = () => {
      time += 0.0015; // Waaaaay slower base time

      // Removed breathe and parallax scaling so the background is perfectly static while scrolling

      ctx.clearRect(0, 0, w, h);
      ctx.save();

      // Nodes - Neural Dot Rendering
      ctx.globalCompositeOperation = "screen";
      NODES.forEach((n) => {
        const distToMouse = mouse.active
          ? Math.hypot(n.x - mouse.x, n.y - mouse.y)
          : 999;
        const proximity = Math.max(0, 1 - distToMouse / 250);

        // Random organic firing (pulses)
        const isFiring = Math.sin(time * 1.5 + n.phase) > 0.995;
        const pulseVal = isFiring
          ? 1
          : Math.max(0, Math.sin(time * 0.8 + n.phase) * 0.3 + 0.3);

        const r = n.baseR + proximity * 1.5 + pulseVal * 0.5;

        // Dynamic interactive colors based on mouse proximity
        let hue = 205; // Base Neural Cyan/Blue
        if (mouse.active) {
          // As mouse gets closer, shift the hue up to Magenta/Purple (+80)
          const colorShift = Math.max(0, 1 - distToMouse / 400);
          hue += colorShift * 80;
        }

        const baseOpacity = n.z;
        const nodeOpacity = Math.max(
          0.05,
          baseOpacity * 0.4 + proximity * 0.3 + pulseVal * 0.4
        );

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);

        if (isFiring) {
          ctx.fillStyle = `hsla(${hue}, 100%, 85%, ${nodeOpacity})`;
          ctx.shadowColor = `hsla(${hue}, 100%, 60%, 1)`;
          ctx.shadowBlur = 12;
        } else if (n.z > 0.5) {
          ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${nodeOpacity})`;
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = `hsla(210, 100%, 40%, ${nodeOpacity * 0.4})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();

        if (isFiring || n.z > 0.8) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 100%, 95%, ${nodeOpacity * 1.2})`;
          ctx.fill();
        }
      });

      ctx.shadowBlur = 0;
      ctx.restore();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 h-screen w-screen overflow-hidden">
      <canvas ref={canvasRef} className="block opacity-100" />
      {/* Grain Overlay Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
