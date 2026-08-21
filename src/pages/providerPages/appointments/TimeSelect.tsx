const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => i * 5); // 00,05,...,55

function to24Hour(hour12: number, minute: number, period: "AM" | "PM") {
    let hour24 = hour12 % 12;
    if (period === "PM") hour24 += 12;
    return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parse24Hour(value: string) {
    const [hourStr, minuteStr] = value.split(":");
    const hour24 = Number(hourStr) || 0;
    const minute = Number(minuteStr) || 0;
    const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return { hour12, minute, period };
}

interface TimeSelectProps {
    value: string; // "HH:MM", 24-hour
    onChange: (value: string) => void;
    disabled?: boolean;
}

const baseSelectClassName =
    "bg-transparent text-[14px] font-medium text-textColor outline-none cursor-pointer rounded-md py-1.5 pl-2 pr-1 text-center transition-colors hover:bg-white focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent";

const TimeSelect = ({ value, onChange, disabled }: TimeSelectProps) => {
    const { hour12, minute, period } = parse24Hour(value);

    return (
        <div className="flex items-center gap-0.5 rounded-lg border border-lightGreyColor/30 bg-inputBgColor/60 px-1.5 py-1 transition-colors focus-within:border-primaryColorDark focus-within:bg-white">
            <select
                value={hour12}
                disabled={disabled}
                onChange={(e) => onChange(to24Hour(Number(e.target.value), minute, period))}
                aria-label="Hour"
                className={`${baseSelectClassName} w-14`}
            >
                {HOUR_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                        {h}
                    </option>
                ))}
            </select>
            <span className="text-[13px] font-medium text-textGreyColor/70">:</span>
            <select
                value={minute}
                disabled={disabled}
                onChange={(e) => onChange(to24Hour(hour12, Number(e.target.value), period))}
                aria-label="Minute"
                className={`${baseSelectClassName} w-14`}
            >
                {MINUTE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                        {String(m).padStart(2, "0")}
                    </option>
                ))}
            </select>
            <div className="mx-1 h-4 w-px shrink-0 bg-lightGreyColor/30" />
            <select
                value={period}
                disabled={disabled}
                onChange={(e) => onChange(to24Hour(hour12, minute, e.target.value as "AM" | "PM"))}
                aria-label="AM or PM"
                className={`${baseSelectClassName} w-16 font-semibold text-primaryColorDark`}
            >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>
    );
};

export default TimeSelect;
