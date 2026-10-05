import React, { useEffect, useRef } from "react";

interface NetworkNode {
  x: number;
  y: number;
  baseVx: number;
  baseVy: number;
  vx: number;
  vy: number;
  radius: number;
  isSpecial: boolean; // active/major node with stronger cyan glow
  pulseOffset: number;
}

/**
 * PortalNetworkBackground
 *
 * High-contrast, interactive digital network background strictly scoped to
 * the "Select Your Portal" section.
 *
 * Design Spec:
 * - Light Section Background + Dark Navy Network Lines + Bright Blue/Cyan Nodes + Subtle Glow
 * - Highly visible against light background (#EEF3F8)
 * - HTML5 Canvas with transparent background (100% preserves section styling)
 * - Interactive mouse physics and dynamic distance-based connecting lines
 * - Retina-crisp DPI scaling, prefers-reduced-motion friendly
 * - pointer-events: none ensures zero interference with cards, buttons, or links
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

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse coordinates relative to the section canvas
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      radius: 160, // interactive influence radius
      isActive: false,
    };

    let nodes: NetworkNode[] = [];
    const maxConnectionDistance = 135;

    const initNodes = () => {
      // Density scaled to section dimensions (approx 35 - 60 nodes)
      const count = Math.max(
        32,
        Math.min(58, Math.floor((width * height) / 14500))
      );
      nodes = [];

      for (let i = 0; i < count; i++) {
        // Natural ambient drift
        const speed = prefersReducedMotion ? 0 : 0.32;
        const vx = (Math.random() - 0.5) * speed;
        const vy = (Math.random() - 0.5) * speed;

        // ~30% are major active nodes with stronger cyan glow
        const isSpecial = i % 3 === 0;
        const radius = isSpecial
          ? Math.random() * 0.8 + 2.8 // 2.8px - 3.6px for major nodes
          : Math.random() * 0.6 + 2.0; // 2.0px - 2.6px for regular nodes

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

    // Track mouse within the section container
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

      // Smooth mouse cursor interpolation
      if (mouse.isActive) {
        mouse.x += (mouse.targetX - mouse.x) * 0.16;
        mouse.y += (mouse.targetY - mouse.y) * 0.16;
      } else {
        mouse.x = -2000;
        mouse.y = -2000;
      }

      // Transparent clear — preserves background color
      ctx.clearRect(0, 0, width, height);

      // Ambient radial spotlight around cursor (deep blue / soft cyan aura)
      if (mouse.isActive && mouse.x > 0 && mouse.y > 0 && !prefersReducedMotion) {
        const aura = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius
        );
        aura.addColorStop(0, "rgba(6, 182, 212, 0.08)");
        aura.addColorStop(0.5, "rgba(15, 30, 75, 0.04)");
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

          // Restorative damping toward base velocity
          node.vx += (node.baseVx - node.vx) * 0.02;
          node.vy += (node.baseVy - node.vy) * 0.02;

          // Boundary wrap
          if (node.x < -20) node.x = width + 20;
          else if (node.x > width + 20) node.x = -20;
          if (node.y < -20) node.y = height + 20;
          else if (node.y > height + 20) node.y = -20;

          // Cursor displacement & connection physics
          if (mouse.isActive) {
            const dxMouse = mouse.x - node.x;
            const dyMouse = mouse.y - node.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse < mouse.radius && distMouse > 1) {
              const force = (1 - distMouse / mouse.radius) * 0.65;
              node.vx -= (dxMouse / distMouse) * force * 0.32;
              node.vy -= (dyMouse / distMouse) * force * 0.32;

              // Dark navy line connecting from node to cursor
              const lineAlpha = (1 - distMouse / mouse.radius) * 0.50;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(15, 32, 68, ${lineAlpha})`;
              ctx.lineWidth = 1.15;
              ctx.stroke();
            }
          }
        }
      }

      // 2. DRAW CONNECTING LINES (DARK NAVY / DEEP BLUE - HIGH CONTRAST)
      for (let i = 0; i < nodeCount; i++) {
        const nodeA = nodes[i];

        for (let j = i + 1; j < nodeCount; j++) {
          const nodeB = nodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectionDistance) {
            // Distance-based opacity: strong enough to clearly see on light background
            const distanceRatio = 1 - dist / maxConnectionDistance;
            const baseAlpha = nodeA.isSpecial || nodeB.isSpecial ? 0.45 : 0.36;
            const alpha = distanceRatio * baseAlpha;

            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            // Deep navy / dark blue line
            ctx.strokeStyle = `rgba(15, 32, 68, ${alpha})`;
            ctx.lineWidth = distanceRatio > 0.5 ? 1.15 : 0.85;
            ctx.stroke();
          }
        }
      }

      // 3. DRAW NODES (BRIGHT CYAN/BLUE WITH DARK CONTRAST RIM & SUBTLE GLOW)
      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];

        // Subtle organic breathing pulse
        const pulse = Math.sin(time + node.pulseOffset) * 0.18 + 1;
        const glowRadius = node.radius * (node.isSpecial ? 3.6 : 2.5) * pulse;

        // A. Subtle bright outer glow halo
        const glow = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          glowRadius
        );

        if (node.isSpecial) {
          glow.addColorStop(0, "rgba(6, 182, 212, 0.55)"); // Vibrant Cyan
          glow.addColorStop(0.5, "rgba(2, 132, 199, 0.22)");
          glow.addColorStop(1, "rgba(6, 182, 212, 0)");
        } else {
          glow.addColorStop(0, "rgba(14, 116, 215, 0.38)"); // Royal Blue
          glow.addColorStop(0.6, "rgba(15, 32, 68, 0.12)");
          glow.addColorStop(1, "rgba(15, 32, 68, 0)");
        }

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // B. Dark navy perimeter ring (Guarantees razor-sharp contrast against light background)
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 0.65, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(10, 24, 52, 0.88)";
        ctx.fill();

        // C. Bright Blue / Cyan Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isSpecial ? "#06b6d4" : "#0284c7";
        ctx.fill();

        // D. Tech pinpoint spark in center
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = node.isSpecial ? "#f0fdf4" : "#e0f2fe";
        ctx.fill();
      }

      // 4. DRAW CURSOR RETICLE (Interactive focal point)
      if (mouse.isActive && mouse.x > 0 && mouse.y > 0 && !prefersReducedMotion) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(15, 32, 68, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      render(); // Static single render
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
