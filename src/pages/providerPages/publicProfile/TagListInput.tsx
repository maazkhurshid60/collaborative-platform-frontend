import { useState } from "react";
import { X } from "lucide-react";

interface TagListInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const TagListInput = ({
  label,
  values,
  onChange,
  placeholder,
}: TagListInputProps) => {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft("");
  };

  return (
    <div>
      <label className="block text-[14px] font-medium text-[#333333] mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((value) => (
          <span
            key={value}
            className="flex items-center gap-1 bg-primaryColorLight text-primaryColorDark text-[13px] px-3 py-1 rounded-full"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((v) => v !== value))}
              className="cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
        placeholder={placeholder || "Type and press Enter to add"}
        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[#2C9993]"
      />
    </div>
  );
};

export default TagListInput;
