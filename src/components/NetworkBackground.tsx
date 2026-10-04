import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates (default off-screen)
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 140, // interaction radius
    };

    // Calculate node count based on screen area (smooth, 30-50 nodes)
    const nodeCount = Math.max(25, Math.min(50, Math.floor((width * height) / 32000)));

    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      nodes.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.2 + 1.2, // 1.2px - 2.4px
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    let isDocumentVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = () => {
      if (!isDocumentVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Move nodes slowly
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around boundaries gently
        if (node.x < -20) node.x = width + 20;
        else if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        else if (node.y > height + 20) node.y = -20;

        // Cursor reaction: subtle interactive displacement
        const dxMouse = mouse.x - node.x;
        const dyMouse = mouse.y - node.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouse.radius && distMouse > 0) {
          const force = (1 - distMouse / mouse.radius) * 1.5;
          node.x -= (dxMouse / distMouse) * force;
          node.y -= (dyMouse / distMouse) * force;

          // Connect subtle line to mouse
          const lineAlpha = (1 - distMouse / mouse.radius) * 0.14;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(30, 64, 130, 0.22)";
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = node.x - nodeB.x;
          const dy = node.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.12;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(30, 64, 130, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 h-full w-full"
      style={{ opacity: 0.85 }}
    />
  );
}
