"use client";

export default function BismillahDivider() {
  return (
    // Root container strictly 22px. 
    // Using overflow-visible ensures tall Arabic diacritics don't get accidentally clipped.
    <div className="relative flex h-[22px] w-full items-center justify-center overflow-visible" dir="rtl">
      
      {/* Ambient glow - slightly warmer and wider to match the 22px height */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-6 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/15 blur-[4px]" />

      {/* Left Decorative Line */}
      <div className="flex flex-1 items-center justify-end">
        <div className="h-[1px] w-full bg-gradient-to-l from-amber-500/70 via-amber-500/20 to-transparent" />
        {/* Tiny geometric diamond accent */}
        <div className="ml-2 h-1 w-1 rotate-45 bg-amber-500/80" />
      </div>
      
      {/* Bismillah Text */}
      <div className="mx-2 flex items-center justify-center md:mx-4">
        {/* Fixed responsive sizing: 18px on mobile, scales up to 22px on desktop */}
        <span className="font-arabic text-[18px] leading-none text-amber-500 drop-shadow-[0_1px_3px_rgba(245,158,11,0.4)] sm:text-[20px] md:text-[22px]">
          ﷽
        </span>
      </div>

      {/* Right Decorative Line */}
      <div className="flex flex-1 items-center justify-start">
        {/* Tiny geometric diamond accent */}
        <div className="mr-2 h-1 w-1 rotate-45 bg-amber-500/80" />
        <div className="h-[1px] w-full bg-gradient-to-r from-amber-500/70 via-amber-500/20 to-transparent" />
      </div>
      
    </div>
  );
}