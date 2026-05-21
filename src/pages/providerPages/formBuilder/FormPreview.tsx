import { Eye } from "lucide-react";
import { FormField } from "./formBuilder.types";

interface FormPreviewProps {
  title: string;
  description: string;
  fields: FormField[];
  fullWidth?: boolean;
}


function FormPreview({ title, description, fields, fullWidth }: FormPreviewProps) {
  return (
    <div className={`${fullWidth ? "w-full" : "max-w-xl w-full"} bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden self-start font-[Poppins]`}>
      <div className="h-2 bg-primaryColorDark" />

      <div className="p-6">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-4 uppercase font-bold tracking-wider pb-2 border-b">
          <span>Dynamic Client Portal View</span>
          <span className="flex items-center text-primaryColorDark bg-primaryColorLight/40 px-2 py-0.5 rounded-full">
            <Eye className="w-3 h-3 mr-1" />
            Live preview
          </span>
        </div>


        <div className="border-b border-gray-100 pb-4 mb-6 text-left">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {title || "Untitled Document Form"}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            {description || "No description provided."}
          </p>
        </div>

        {/* Field previews */}
        <div className="space-y-6">
          {fields.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
              <Eye className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Render preview will show up here</p>
            </div>
          ) : (
            fields.map((field) => {
              if (field.type === "heading") {
                const Tag = (["h2", "h3", "h4", "h5", "h6", "h6"] as const)[(field.level ?? 2) - 1] ?? "h3";
                const sizeClass =
                  field.level === 1
                    ? "text-xl font-bold text-gray-900 border-b pb-1 mt-6"
                    : field.level === 2
                      ? "text-lg font-semibold text-gray-800 mt-4"
                      : field.level === 3
                        ? "text-base font-medium text-gray-700 mt-3"
                        : field.level === 4
                          ? "text-sm font-semibold text-gray-700 mt-2"
                          : field.level === 5
                            ? "text-xs font-semibold text-gray-600 mt-2 uppercase tracking-wide"
                            : "text-[11px] font-bold text-gray-500 mt-1 uppercase tracking-widest";
                return (
                  <Tag key={field.id} className={`${sizeClass} text-left`}>
                    {field.text}
                  </Tag>
                );
              }

              if (field.type === "paragraph") {
                return (
                  <p key={field.id} className="text-xs text-gray-600 leading-relaxed text-left">
                    {field.text}
                  </p>
                );
              }

              if (field.type === "list") {
                return (
                  <ul key={field.id} className="list-disc pl-5 text-xs text-gray-600 space-y-1 text-left">
                    {field.items?.map((bullet, i) => <li key={i}>{bullet}</li>)}
                  </ul>
                );
              }

              return (
                <div key={field.id} className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-gray-700">
                    {field.label || "Untitled Field"}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === "text" && (
                    <input
                      type="text"
                      disabled
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-gray-50 text-gray-400"
                      placeholder="Text answer input placeholder"
                    />
                  )}

                  {field.type === "date" && (
                    <input
                      type="date"
                      disabled
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-gray-50 text-gray-400"
                    />
                  )}

                  {field.type === "boolean" && (
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" disabled className="h-4 w-4 border-gray-300 rounded" />
                      <span className="text-[11px] text-gray-500">I declare my agreement.</span>
                    </div>
                  )}

                  {field.type === "checkbox-group" && (
                    <div className="grid grid-cols-2 gap-2 border p-3 rounded-lg bg-gray-50">
                      {field.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <input type="checkbox" disabled className="h-3.5 w-3.5" />
                          <span className="text-[11px] text-gray-500">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {field.type === "radio-group" && (
                    <div className="grid grid-cols-2 gap-2 border p-3 rounded-lg bg-gray-50">
                      {field.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <input type="radio" disabled className="h-3.5 w-3.5" />
                          <span className="text-[11px] text-gray-500">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {field.type === "signature" && (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                          ENTER YOUR NAME TO SIGN
                        </label>
                        <input
                          type="text"
                          disabled
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-gray-100 text-gray-400"
                          placeholder="Type your full name"
                        />
                      </div>
                      <div className="border border-dashed border-gray-300 rounded-lg bg-white p-4 flex flex-col justify-center items-center min-h-[90px]">
                        <span
                          style={{
                            fontFamily: "'Great Vibes', 'Playball', 'Georgia', cursive",
                            fontSize: "24px",
                            fontWeight: "normal",
                            color: "#94a3b8",
                            fontStyle: "italic",
                          }}
                          className="block break-all text-center"
                        >
                          {field.label || "Signature Preview"}
                        </span>
                        <div className="border-t border-gray-100 mt-2 pt-1 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                          Certified E-Signature Preview
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Disabled submit button */}
        <div className="mt-8 pt-6 border-t">
          <button
            disabled
            className="w-full py-2.5 text-xs font-bold text-white bg-primaryColorDark opacity-60 rounded-xl"
          >
            Submit and Lock Form (Preview Only)
          </button>
        </div>
      </div>
    </div>
  );
}


export default FormPreview;