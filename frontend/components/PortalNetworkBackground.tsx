import React, { useEffect, useRef } from "react";

interface NetworkNode {
  x: number;
  y: number;
  baseVx: number;
  baseVy: number;
  vx: number;
  vy: number;
  radius: number;
  isSpecial: boolean;
  pulseOffset: number;
}

/**
 * PortalNetworkBackground
 *
 * High-contrast, interactive digital network background strictly adhering to
 * the franchise green brand identity:
 * - Primary forest green (#073B2A)
 * - Emerald (#13845B)
 * - Mint (#72D6A0) & Light Mint (#C7F1DC)
 * - Cream (#F6F1E7)
 */
export function PortalNetworkBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      radius: 160,
      isActive: false,
    };

    let nodes: NetworkNode[] = [];
    const maxConnectionDistance = 140;

    const initNodes = () => {
      const count = Math.max(
        30,
        Math.min(54, Math.floor((width * height) / 15000))
      );
      nodes = [];

      for (let i = 0; i < count; i++) {
        const speed = prefersReducedMotion ? 0 : 0.32;
        const vx = (Math.random() - 0.5) * speed;
        const vy = (Math.random() - 0.5) * speed;

        const isSpecial = i % 3 === 0;
        const radius = isSpecial
          ? Math.random() * 0.8 + 2.8
          : Math.random() * 0.6 + 2.0;

        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseVx: vx,
          baseVy: vy,
          vx,
          vy,
          radius,
          isSpecial,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    const updateDimensions = () => {
      if (!canvas || !container || !ctx) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initNodes();
    };

    updateDimensions();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (
        clientX >= -60 &&
        clientX <= width + 60 &&
        clientY >= -60 &&
        clientY <= height + 60
      ) {
        mouse.targetX = clientX;
        mouse.targetY = clientY;
        mouse.isActive = true;
      } else {
        mouse.targetX = -2000;
        mouse.targetY = -2000;
        mouse.isActive = false;
      }
    };

    const handleMouseLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
      mouse.isActive = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    let isDocumentVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = () => {
      if (!isDocumentVisible || !ctx) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (mouse.isActive) {
        mouse.x += (mouse.targetX - mouse.x) * 0.16;
        mouse.y += (mouse.targetY - mouse.y) * 0.16;
      } else {
        mouse.x = -2000;
        mouse.y = -2000;
      }

      ctx.clearRect(0, 0, width, height);

      // Subtle emerald spotlight around cursor
      if (mouse.isActive && mouse.x > 0 && mouse.y > 0 && !prefersReducedMotion) {
        const aura = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius
        );
        aura.addColorStop(0, "rgba(114, 214, 160, 0.12)");
        aura.addColorStop(0.5, "rgba(7, 59, 42, 0.04)");
        aura.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const nodeCount = nodes.length;
      const time = Date.now() * 0.002;

      // 1. UPDATE POSITIONS & PHYSIC REACTION
      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          node.vx += (node.baseVx - node.vx) * 0.02;
          node.vy += (node.baseVy - node.vy) * 0.02;

          if (node.x < -20) node.x = width + 20;
          else if (node.x > width + 20) node.x = -20;
          if (node.y < -20) node.y = height + 20;
          else if (node.y > height + 20) node.y = -20;

          if (mouse.isActive) {
            const dxMouse = mouse.x - node.x;
            const dyMouse = mouse.y - node.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse < mouse.radius && distMouse > 1) {
              const force = (1 - distMouse / mouse.radius) * 0.65;
              node.vx -= (dxMouse / distMouse) * force * 0.32;
              node.vy -= (dyMouse / distMouse) * force * 0.32;

              // Forest green line connecting to cursor
              const lineAlpha = (1 - distMouse / mouse.radius) * 0.45;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(7, 59, 42, ${lineAlpha})`;
              ctx.lineWidth = 1.1;
              ctx.stroke();
            }
          }
        }
      }

      // 2. DRAW CONNECTING LINES (FOREST GREEN & EMERALD)
      for (let i = 0; i < nodeCount; i++) {
        const nodeA = nodes[i];

        for (let j = i + 1; j < nodeCount; j++) {
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectionDistance) {
            const distanceRatio = 1 - dist / maxConnectionDistance;
            const baseAlpha = nodeA.isSpecial || nodeB.isSpecial ? 0.35 : 0.22;
            const alpha = distanceRatio * baseAlpha;

            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(7, 59, 42, ${alpha})`;
            ctx.lineWidth = distanceRatio > 0.5 ? 1.0 : 0.75;
            ctx.stroke();
          }
        }
      }

      // 3. DRAW NODES (MINT / EMERALD WITH FOREST GREEN RIM)
      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];

        const pulse = Math.sin(time + node.pulseOffset) * 0.18 + 1;
        const glowRadius = node.radius * (node.isSpecial ? 3.5 : 2.4) * pulse;

        // Glow halo
        const glow = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          glowRadius
        );

        if (node.isSpecial) {
          glow.addColorStop(0, "rgba(114, 214, 160, 0.55)"); // Mint
          glow.addColorStop(0.5, "rgba(19, 132, 91, 0.2)"); // Emerald
          glow.addColorStop(1, "rgba(114, 214, 160, 0)");
        } else {
          glow.addColorStop(0, "rgba(19, 132, 91, 0.35)"); // Emerald
          glow.addColorStop(0.6, "rgba(7, 59, 42, 0.1)");
          glow.addColorStop(1, "rgba(7, 59, 42, 0)");
        }

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Forest green perimeter ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 0.65, 0, Math.PI * 2);
        ctx.fillStyle = "#073B2A";
        ctx.fill();

        // Mint / Emerald Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isSpecial ? "#72D6A0" : "#13845B";
        ctx.fill();

        // Pinpoint highlight in center
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = "#F6F1E7";
        ctx.fill();
      }

      // 4. CURSOR RETICLE
      if (mouse.isActive && mouse.x > 0 && mouse.y > 0 && !prefersReducedMotion) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(114, 214, 160, 0.9)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 7.5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(7, 59, 42, 0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      render();
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

export default PortalNetworkBackground;
