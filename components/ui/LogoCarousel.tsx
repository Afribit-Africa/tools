'use client';

import React, { useEffect, useRef } from 'react';

interface LogoCarouselProps {
  logos: { name: string; icon: React.ReactNode }[];
  speed?: number;
}

export const LogoCarousel: React.FC<LogoCarouselProps> = ({ logos, speed = 30 }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollerRef.current) return;

    const scrollerContent = Array.from(scrollerRef.current.children);

    // Duplicate items for seamless loop
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      scrollerRef.current?.appendChild(duplicatedItem);
    });
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Fade overlays */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-black to-transparent" />

      {/* Scrolling container */}
      <div
        ref={scrollerRef}
        className="flex gap-8 animate-scroll"
        style={{
          animation: `scroll ${speed}s linear infinite`,
        }}
      >
        {logos.map((logo, index) => (
          <div
            key={index}
            className="flex flex-shrink-0 items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300"
          >
            <div className="flex items-center gap-3 text-white/80">
              <div className="text-4xl">{logo.icon}</div>
              <span className="text-xl font-medium">{logo.name}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default LogoCarousel;
