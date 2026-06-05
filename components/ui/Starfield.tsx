"use client";
// components/ui/Starfield.tsx — Animated silver starfield per spec Section 3

import { useEffect, useRef } from "react";

export function Starfield() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stars: HTMLDivElement[] = [];
    const count = 150;

    // Size distribution: 70% @ 1px, 20% @ 1.5px, 10% @ 2px
    const getSize = () => {
      const r = Math.random();
      if (r < 0.7)  return 1;
      if (r < 0.9)  return 1.5;
      return 2;
    };

    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      star.className = "star";

      const size = getSize();
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const dur  = (Math.random() * 5 + 3).toFixed(1); // 3–8s
      const delay = (Math.random() * 6).toFixed(1);     // 0–6s stagger
      // Max opacity between 0.15 and 0.5 — silver-tinted
      const maxOpacity = (Math.random() * 0.35 + 0.15).toFixed(2);
      const minOpacity = "0.05";

      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}%;
        top: ${y}%;
        background: rgba(192, 188, 181, ${maxOpacity});
        --dur: ${dur}s;
        --delay: ${delay}s;
        --min-opacity: ${minOpacity};
        --max-opacity: ${maxOpacity};
        animation-delay: ${delay}s;
      `;
      container.appendChild(star);
      stars.push(star);
    }

    return () => {
      stars.forEach((s) => s.remove());
    };
  }, []);

  return <div ref={containerRef} className="starfield" aria-hidden="true" />;
}
