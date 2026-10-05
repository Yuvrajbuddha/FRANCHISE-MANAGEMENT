import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  baseVx: number;
  baseVy: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

/**
 * PortalNetworkBackground
 * 
 * Subtle, interactive, network-style animation strictly scoped to the 
 * "Select Your Portal" section.
 * 
 * - HTML5 Canvas with transparent background (preserves exact section color).
 * - Small subtle dots and very thin low-opacity connecting lines.
 * - Gentle mouse reactivity when hovering over the section.
 * - Responsive, Retina-crisp (DPI aware), reduced-motion friendly, touch-friendly.
 * - Pointer-events: none to guarantee zero interference with buttons and cards.
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
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      radius: 140, // subtle interaction radius
      isActive: false,
    };

    // Low-opacity, enterprise palette harmonizing with the 3 portal cards
    const palette = [
      "rgba(79, 70, 229, ",  // Indigo (Franchisee)
      "rgba(13, 148, 136, ", // Teal (Store)
      "rgba(16, 185, 129, ", // Emerald (Quality Officer)
      "rgba(37, 99, 235, ",  // Blue (General Enterprise)
    ];

    let nodes: Node[] = [];
    const maxConnectionDistance = 125;

    const initNodes = () => {
      // Scale node count conservatively based on section area (25 - 45 nodes)
      const count = Math.max(22, Math.min(45, Math.floor((width * height) / 22000)));
      nodes = [];

      for (let i = 0; i < count; i++) {
        // Slow, elegant ambient drift
        const speed = prefersReducedMotion ? 0 : 0.28;
        const vx = (Math.random() - 0.5) * speed;
        const vy = (Math.random() - 0.5) * speed;
        const color = palette[i % palette.length];

        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseVx: vx,
          baseVy: vy,
          vx,
          vy,
          radius: Math.random() * 1.0 + 1.1, // Small 1.1px - 2.1px circular nodes
          color,
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

      // Only activate if cursor is within or immediately adjacent to this section
      if (
        clientX >= -50 &&
        clientX <= width + 50 &&
        clientY >= -50 &&
        clientY <= height + 50
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

      // Smooth cursor lerp interpolation
      if (mouse.isActive) {
        mouse.x += (mouse.targetX - mouse.x) * 0.16;
        mouse.y += (mouse.targetY - mouse.y) * 0.16;
      } else {
        mouse.x = -2000;
        mouse.y = -2000;
      }

      // Transparent clear — preserves underlying section background color 100%
      ctx.clearRect(0, 0, width, height);

      // Faint, subtle ambient radial focus around cursor
      if (mouse.isActive && mouse.x > 0 && mouse.y > 0 && !prefersReducedMotion) {
        const aura = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius
        );
        aura.addColorStop(0, "rgba(59, 130, 246, 0.04)");
        aura.addColorStop(0.6, "rgba(99, 102, 241, 0.015)");
        aura.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const nodeCount = nodes.length;

      // Update positions & draw network
      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          // Gentle restorative damping towards base velocity
          node.vx += (node.baseVx - node.vx) * 0.02;
          node.vy += (node.baseVy - node.vy) * 0.02;

          // Boundary wrap
          if (node.x < -15) node.x = width + 15;
          else if (node.x > width + 15) node.x = -15;
          if (node.y < -15) node.y = height + 15;
          else if (node.y > height + 15) node.y = -15;

          // Cursor interaction: gentle displacement & subtle connection
          if (mouse.isActive) {
            const dxMouse = mouse.x - node.x;
            const dyMouse = mouse.y - node.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse < mouse.radius && distMouse > 1) {
              const force = (1 - distMouse / mouse.radius) * 0.6;
              node.vx -= (dxMouse / distMouse) * force * 0.35;
              node.vy -= (dyMouse / distMouse) * force * 0.35;

              // Subtle web connection to cursor
              const lineAlpha = (1 - distMouse / mouse.radius) * 0.18;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(59, 130, 246, ${lineAlpha})`;
              ctx.lineWidth = 0.75;
              ctx.stroke();
            }
          }
        }

        // Draw node (small circular dot with low opacity)
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}0.30)`;
        ctx.fill();

        // Connect nearby nodes within distance threshold
        for (let j = i + 1; j < nodeCount; j++) {
          const nodeB = nodes[j];
          const dx = node.x - nodeB.x;
          const dy = node.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectionDistance) {
            // Low opacity thin line (fading out smoothly as distance increases)
            const alpha = (1 - dist / maxConnectionDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      render(); // Render once statically
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
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
