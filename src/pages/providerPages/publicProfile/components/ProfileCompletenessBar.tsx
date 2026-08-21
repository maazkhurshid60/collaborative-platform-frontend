export const PUBLISH_THRESHOLD_PERCENT = 50;

interface ProfileCompletenessBarProps {
  completenessPercent: number;
  helperText?: string;
  className?: string;
}

export const ProfileCompletenessBar = ({
  completenessPercent,
  helperText,
  className = "",
}: ProfileCompletenessBarProps) => {
  const percent = completenessPercent ?? 0;
  const meetsThreshold = percent >= PUBLISH_THRESHOLD_PERCENT;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium text-[#333333]">Profile completeness</span>
        <span
          className={`text-[13px] font-semibold ${
            meetsThreshold ? "text-[#059669]" : "text-[#667085]"
          }`}
        >
          {percent}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-inputBgColor overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            meetsThreshold ? "bg-[#059669]" : "bg-primaryColorDark"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      {helperText && !meetsThreshold && (
        <p className="mt-1.5 text-[12px] text-[#667085]">{helperText}</p>
      )}
    </div>
  );
};
