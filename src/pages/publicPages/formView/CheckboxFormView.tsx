import React from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Check } from "lucide-react";
import { PDFFormViewField } from "@/pdf/types/pdf.types";

interface CheckboxFormViewProps {
  field: PDFFormViewField;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const CheckboxFormView: React.FC<CheckboxFormViewProps> = ({
  field,
  watch,
  setValue,
}) => {
  const selected: string[] = watch(field.id) || [];

  const toggle = (opt: string, checked: boolean) => {
    setValue(
      field.id,
      checked ? [...selected, opt] : selected.filter((v) => v !== opt),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {field.options?.map((opt) => {
        const isChecked = selected.includes(opt);

        return (
          <label
            key={opt}
            className={[
              "group relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer",
              "border transition-all duration-150 ease-out",
              isChecked
                ? "border-primaryColorDark bg-primaryColorLight/20 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
            ].join(" ")}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => toggle(opt, e.target.checked)}
              className="sr-only"
            />

            <span
              aria-hidden
              className={[
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px]",
                "border transition-colors duration-150",
                isChecked
                  ? "bg-primaryColorDark border-primaryColorDark"
                  : "bg-white border-gray-300 group-hover:border-gray-400",
              ].join(" ")}
            >
              <Check
                className={`h-3.5 w-3.5 text-white transition-opacity ${
                  isChecked ? "opacity-100" : "opacity-0"
                }`}
                strokeWidth={3}
              />
            </span>

            <span
              className={`text-sm font-medium select-none transition-colors ${
                isChecked ? "text-primaryColorDark" : "text-gray-700"
              }`}
            >
              {opt}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default CheckboxFormView;
