import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { PDFFormViewField } from "@/pdf/types/pdf.types";

interface SignatureFormViewProps {
  field: PDFFormViewField;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  disabled?: boolean;
}

const SignatureFormView: React.FC<SignatureFormViewProps> = ({
  field,
  register,
  errors,
  watch,
  disabled,
}) => {
  return (
    <div
      className={`border border-primaryColorLight rounded-xl p-6 space-y-4 ${disabled ? "opacity-75 pointer-events-none" : "border-gray-200 bg-gray-30"}`}
    >
      <div>
        <label
          className={`block text-xs font-semibold mb-1 ${disabled ? "" : "text-gray-500"}`}
        >
          ENTER YOUR NAME TO SIGN
        </label>
        <input
          type="text"
          disabled={disabled}
          {...register(field.id, { required: !disabled && field.required })}
          className={`w-full px-4 py-2.5 border border-primaryColorLight rounded-lg focus:outline-none focus:ring-1 focus:ring-primaryColorDark focus:border-primaryColorDark transition duration-150 ${
            disabled
              ? ""
              : errors[field.id]
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
          }`}
          placeholder="Type your full name"
        />
      </div>

      {/* Signature Cursive Preview */}
      <div
        className={`border border-dashed border-primaryColorLight rounded-lg p-6 flex flex-col justify-center items-center min-h-30 transition duration-150 relative ${disabled ? "" : "bg-white border-gray-300"}`}
      >
        {watch(field.id) ? (
          <div className="text-center">
            <span
              style={{
                fontFamily: "'Great Vibes', 'Playball', 'Georgia', cursive",
                fontSize: "36px",
                fontWeight: "normal",
                color: "#1e293b",
                fontStyle: "italic",
              }}
              className="block break-all"
            >
              {watch(field.id)}
            </span>
            <div
              className={`border-t mt-4 pt-1.5 text-[10px] font-bold uppercase tracking-wider ${disabled ? "" : "border-gray-100 text-gray-400"}`}
            >
              Certified E-Signature
            </div>
          </div>
        ) : (
          <div
            className={`text-center text-xs ${disabled ? "text-amber-700/60" : "text-gray-400"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 mx-auto mb-1 opacity-40 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span>Your styled signature will show up here</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureFormView;
