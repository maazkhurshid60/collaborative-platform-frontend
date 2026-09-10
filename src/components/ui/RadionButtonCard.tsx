interface RadioCardProps {
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  selectedClassName?: string;
  selectedRadioClassName?: string;
}

const RadioButtonCard: React.FC<RadioCardProps> = ({
  value,
  selectedValue,
  onChange,
  title,
  description,
  selectedClassName = "border-amber-500 bg-amber-50",
  selectedRadioClassName = "border-amber-500 bg-amber-500",
}) => {
  const isSelected = selectedValue === value;

  return (
    <label
      className={`relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? selectedClassName
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <input
        type="radio"
        name="radio-card"
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        className="sr-only"
      />

      {/* Custom Radio */}
      <span
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isSelected ? selectedRadioClassName : "border-gray-300 bg-white"
        }`}
      >
        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
      </span>

      {/* Content */}
      <div>
        <span className="block text-sm font-semibold text-gray-800">
          {title}
        </span>

        {description && (
          <span className="block text-xs text-gray-500 mt-0.5">
            {description}
          </span>
        )}
      </div>
    </label>
  );
};

export default RadioButtonCard;
