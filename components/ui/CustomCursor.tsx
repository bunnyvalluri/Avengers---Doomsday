"use client";

import { useEffect, useRef } from "react";
import styles from "./ui.module.css";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isHovering = false;
    let isClicking = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest("button, a, input, select, [role='button'], .clickable");
        isHovering = !!interactive;
      }
    };

    const onMouseDown = () => {
      isClicking = true;
    };
    const onMouseUp = () => {
      isClicking = false;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });

    let rafId: number;
    const render = () => {
      // Smooth spring follow for outer reticle ring
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        const scale = isClicking ? 0.75 : isHovering ? 1.45 : 1.0;
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale})`;
        if (isHovering) {
          ringRef.current.classList.add(styles.cursorHover);
        } else {
          ringRef.current.classList.remove(styles.cursorHover);
        }
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className={styles.cursorContainer} aria-hidden>
      <div ref={dotRef} className={styles.cursorDot} />
      <div ref={ringRef} className={styles.cursorRing}>
        <span className={styles.cursorCrossH} />
        <span className={styles.cursorCrossV} />
      </div>
    </div>
  );
}
