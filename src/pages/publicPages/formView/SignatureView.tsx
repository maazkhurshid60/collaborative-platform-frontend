import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { PDFFormViewField } from "@/pdf/types/pdf.types";

interface SignatureFormViewProps {
  field: PDFFormViewField;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
}

const SignatureFormView: React.FC<SignatureFormViewProps> = ({
  field,
  register,
  errors,
  watch,
}) => {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-gray-30 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          ENTER YOUR NAME TO SIGN
        </label>
        <input
          type="text"
          {...register(field.id, { required: field.required })}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primaryColorDark focus:border-primaryColorDark transition duration-150 ${
            errors[field.id] ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
          placeholder="Type your full name"
        />
      </div>

      {/* Signature Cursive Preview */}
      <div className="border border-dashed border-gray-300 rounded-lg bg-white p-6 flex flex-col justify-center items-center min-h-[120px] transition duration-150 relative">
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
            <div className="border-t border-gray-100 mt-4 pt-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Certified E-Signature
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-xs">
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
