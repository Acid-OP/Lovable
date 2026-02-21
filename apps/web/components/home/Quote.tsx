import Image from "next/image";

export function Quote() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-[family-name:var(--font-heading)] text-[18px] sm:text-[22px] text-[#555] leading-[1.6] tracking-[-0.01em] italic mb-5">
          &ldquo;Work until the people who doubted you become the ones bragging
          about knowing you.&rdquo;
        </p>
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/gaurav-avatar.jpg"
            alt="Gaurav Kapur"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
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
