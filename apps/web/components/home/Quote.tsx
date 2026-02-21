export function Quote() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-[family-name:var(--font-heading)] text-[18px] sm:text-[22px] text-[#555] leading-[1.6] tracking-[-0.01em] italic mb-5">
          &ldquo;The gap between an idea and a shipped app should be zero. I
          built this to prove it.&rdquo;
        </p>
        <div className="flex items-center justify-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#2d2d2d] flex items-center justify-center text-[10px] font-semibold text-white">
            G
          </div>
          <div className="text-left">
            <p className="text-[12px] font-medium text-[#1a1a1a]">
              Gaurav Kapur
            </p>
            <p className="text-[11px] text-[#aaa]">Creator of Bolt</p>
          </div>
        </div>
      </div>
    </section>
  );
}
