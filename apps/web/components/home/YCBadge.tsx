export function YCBadge() {
  return (
    <div className="flex items-center justify-center mb-4 sm:mb-6">
      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-50 border border-orange-200 rounded-full">
        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#FF6600] flex items-center justify-center text-white font-bold text-[10px] sm:text-[11px] rounded-sm">
          Y
        </div>
        <span className="text-[12px] sm:text-[14px] font-medium text-gray-700">
          Not Backed by Y Combinator
        </span>
      </div>
    </div>
  );
}
