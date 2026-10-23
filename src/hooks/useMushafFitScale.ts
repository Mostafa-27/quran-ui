"use client";

import { useLayoutEffect, useRef } from "react";

export function useMushafFitScale(
  containerRef: React.RefObject<HTMLElement | null>,
  pageRef: React.RefObject<HTMLElement | null>,
  enabled: boolean = true
) {
  const frameRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    const page = pageRef.current;
    if (!container || !page) return;

    const updateScale = () => {
      const pageWidth = page.offsetWidth;
      const pageHeight = page.offsetHeight;

      if (!pageWidth || !pageHeight) return;

      const availableWidth = Math.max(container.clientWidth - 16, 1);
      const availableHeight = Math.max(container.clientHeight - 16, 1);

      const widthScale = availableWidth / pageWidth;
      const heightScale = availableHeight / pageHeight;
      const rawScale = Math.min(widthScale, heightScale);

      // Keep text readable on very small screens while still fitting.
      const scale = Math.min(Math.max(rawScale, 0.4), 1.25);

      container.style.setProperty("--mushaf-scale", scale.toString());
    };

    const scheduleUpdate = () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(updateScale);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container);
    resizeObserver.observe(page);

    window.addEventListener("resize", scheduleUpdate);
    document.fonts?.ready?.then(scheduleUpdate).catch(() => {});

    scheduleUpdate();

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [containerRef, pageRef, enabled]);
}
