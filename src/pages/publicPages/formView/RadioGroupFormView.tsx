import React from "react";
import { UseFormRegister } from "react-hook-form";
import { PDFFormViewField } from "@/pdf/types/pdf.types";

interface RadioGroupFormViewProps {
  field: PDFFormViewField;
  register: UseFormRegister<any>;
}

const RadioGroupFormView: React.FC<RadioGroupFormViewProps> = ({
  field,
  register,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {field.options?.map((opt) => {
        return (
          <label
            key={opt}
            className={[
              "group relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer",
              "border transition-all duration-150 ease-out",
              "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
              "has-[:checked]:border-primaryColorDark has-[:checked]:bg-primaryColorLight/20 has-[:checked]:shadow-sm",
            ].join(" ")}
          >
            <input
              type="radio"
              value={opt}
              {...register(field.id, {
                required: field.required,
              })}
              className="sr-only"
            />

            <span
              aria-hidden
              className={[
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                "border bg-white border-gray-300 transition-colors duration-150",
                "group-hover:border-gray-400",
                "group-has-[:checked]:border-primaryColorDark",
              ].join(" ")}
            >
              <span className="h-2 w-2 rounded-full bg-primaryColorDark opacity-0 group-has-[:checked]:opacity-100 transition-opacity duration-150" />
            </span>

            <span className="text-sm font-medium text-gray-700 select-none transition-colors group-has-[:checked]:text-primaryColorDark">
              {opt}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default RadioGroupFormView;
