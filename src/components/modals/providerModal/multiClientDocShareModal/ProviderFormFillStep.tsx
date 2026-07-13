import React, { useMemo } from "react";
import { useForm } from "react-hook-form";

import Button from "../../../button/Button";
import SignatureFormView from "../../../../pages/publicPages/formView/SignatureView";
import RadioGroupFormView from "../../../../pages/publicPages/formView/RadioGroupFormView";
import CheckboxFormView from "../../../../pages/publicPages/formView/CheckboxFormView";

interface FormSchemaField {
  id: string;
  type: string;
  label?: string;
  required?: boolean;
  options?: string[];
  level?: number;
  text?: string;
  items?: string[];
}

interface ProviderFormFillStepProps {
  forms: { id: string; name: string; description?: string; schema: { fields: FormSchemaField[] } }[];
  onBack: () => void;
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting: boolean;
}

const ProviderFormFillStep: React.FC<ProviderFormFillStepProps> = ({
  forms,
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // Extract all fields that fall strictly under a provider-section to see if there are any
  const hasProviderFields = useMemo(() => {
    for (const form of forms) {
      if (!form.schema?.fields) continue;

      let inProviderSection = false;
      for (const field of form.schema.fields) {
        if (field.type === "provider-section") {
          inProviderSection = true;
          continue;
        } else if (field.type === "client-section" || field.type === "heading") {
          inProviderSection = false;
          continue;
        }

        if (
          inProviderSection &&
          ["text", "date", "paragraph", "signature", "checkbox-group", "radio-group", "boolean"].includes(field.type)
        ) {
          return true;
        }
      }
    }
    return false;
  }, [forms]);

  if (!hasProviderFields) {
    return (
      <div className="py-8 text-center text-gray-500">
        No provider-specific fields found in the selected forms.
        <div className="mt-6 flex gap-3 justify-center">
          <div className="w-35">
            <Button text="Back" borderButton onclick={onBack} />
          </div>
          <div className="w-45">
            <Button
              text="Send Documents Now"
              onclick={() => onSubmit({})}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 text-left">
      <p className="font-semibold text-[14px] mb-2">Fill Provider Sections</p>
      <p className="text-[12px] text-gray-500 mb-4">
        Please fill out the provider sections in the forms below before sharing.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 max-h-[60vh] overflow-y-auto pr-2"
      >
        {forms.map((form) => (
          <div
            key={form.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden"
          >
            <div className="h-1.5 bg-primaryColorDark" />
            <div className="p-8 space-y-6">
              {/* Form Header */}
              <div className="border-b border-gray-150 pb-5 mb-4 text-left">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  Document Form
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  {form.name}
                </h3>
                {form.description && (
                  <div
                    className="mt-2 text-sm text-gray-500 leading-relaxed w-full overflow-hidden [&_*]:max-w-full [&_*]:whitespace-pre-wrap [&_*]:break-words [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:font-semibold"
                    dangerouslySetInnerHTML={{ __html: form.description }}
                  />
                )}
              </div>

            {/* Form Elements */}
            <div className="space-y-6">
              {(() => {
                let inProvider = false;
                if (!form.schema?.fields) return null;

                return form.schema.fields.map((field) => {
                  // 1. Section Boundary Headers
                  if (field.type === "provider-section") {
                    inProvider = true;
                    return (
                      <div
                        key={field.id}
                        className="mt-6 mb-3 border-l-4 border-amber-400 pl-4 py-2 bg-amber-50/50 rounded-r-lg"
                      >
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider text-left">
                          {field.text || "Provider Only Section"}
                        </h4>
                      </div>
                    );
                  } else if (field.type === "client-section") {
                    inProvider = false;
                    return (
                      <div
                        key={field.id}
                        className="mt-6 mb-3 border-l-4 border-blue-400 pl-4 py-2 bg-blue-50/50 rounded-r-lg"
                      >
                        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider text-left">
                          {field.text || "Client Only Section"}
                        </h4>
                      </div>
                    );
                  } else if (field.type === "heading") {
                    inProvider = false; // default reset
                    const Tag =
                      field.level === 1
                        ? "h2"
                        : field.level === 2
                          ? "h3"
                          : "h4";
                    const sizeClass =
                      field.level === 1
                        ? "text-lg font-bold text-gray-900 border-b pb-1 mt-6"
                        : field.level === 2
                          ? "text-base font-semibold text-gray-800 mt-4"
                          : "text-sm font-medium text-gray-700 mt-3";
                    return (
                      <Tag key={field.id} className={`${sizeClass} text-left`}>
                        {field.text}
                      </Tag>
                    );
                  }

                  // 2. Structural Elements
                  if (field.type === "paragraph") {
                    return (
                      <div
                        key={field.id}
                        className="text-xs text-gray-600 leading-relaxed text-left w-full overflow-hidden [&_*]:max-w-full [&_*]:whitespace-pre-wrap [&_*]:break-words [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5"
                        dangerouslySetInnerHTML={{ __html: field.text || "" }}
                      />
                    );
                  }

                  if (field.type === "list") {
                    return (
                      <ul
                        key={field.id}
                        className="list-disc pl-5 text-xs text-gray-600 space-y-1 text-left"
                      >
                        {field.items?.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    );
                  }

                  const isProviderField = inProvider;

                  // 3. Input Fields
                  return (
                    <div
                      key={field.id}
                      className={`space-y-1.5 text-left p-3.5 rounded-xl border ${
                        isProviderField
                          ? "border-amber-200 bg-amber-50/20"
                          : "border-gray-100 bg-white/50"
                      }`}
                    >
                      <label
                        className={`block text-xs font-semibold ${
                          isProviderField ? "text-amber-900" : "text-gray-700"
                        }`}
                      >
                        {field.label || "Field"}{" "}
                        {field.required && isProviderField && (
                          <span className="text-red-500">*</span>
                        )}
                        {!isProviderField && (
                          <span className="text-[10px] text-gray-400 font-normal ml-2">
                            (Client Field)
                          </span>
                        )}
                      </label>

                      {field.type === "text" && (
                        <input
                          type="text"
                          {...register(field.id, {
                            required: isProviderField && field.required,
                          })}
                          disabled={!isProviderField}
                          className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-primaryColorDark focus:border-primaryColorDark transition duration-150 ${
                            !isProviderField
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : errors[field.id]
                                ? "border-red-300 bg-red-50"
                                : "border-primaryColorLight"
                          }`}
                          placeholder={
                            isProviderField ? "Enter text answer..." : "[Disabled: Will be filled by client]"
                          }
                        />
                      )}

                      {field.type === "date" && (
                        <input
                          type="date"
                          {...register(field.id, {
                            required: isProviderField && field.required,
                          })}
                          disabled={!isProviderField}
                          className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-primaryColorDark focus:border-primaryColorDark transition duration-150 ${
                            !isProviderField
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : errors[field.id]
                                ? "border-red-300 bg-red-50"
                                : "border-primaryColorLight"
                          }`}
                        />
                      )}

                      {field.type === "boolean" && (
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              {...register(field.id, {
                                required: isProviderField && field.required,
                              })}
                              disabled={!isProviderField}
                              className="focus:ring-primaryColorDark h-4 w-4 text-primaryColorDark border-gray-300 rounded transition duration-150"
                            />
                          </div>
                          <div className="ml-3 text-xs">
                            <span className="text-gray-500">
                              I declare my agreement and assent.
                            </span>
                          </div>
                        </div>
                      )}

                      {field.type === "checkbox-group" && (
                        <CheckboxFormView
                          field={field as any}
                          watch={watch}
                          setValue={setValue}
                          disabled={!isProviderField}
                        />
                      )}

                      {field.type === "radio-group" && (
                        <RadioGroupFormView
                          field={field as any}
                          register={register}
                          disabled={!isProviderField}
                        />
                      )}

                      {field.type === "signature" && (
                        <SignatureFormView
                          field={field as any}
                          register={register}
                          errors={errors}
                          watch={watch}
                          disabled={!isProviderField}
                        />
                      )}

                      {errors[field.id] && isProviderField && (
                        <p className="text-red-500 text-[10px] font-medium mt-1">
                          This field is required.
                        </p>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
            </div>
          </div>
        ))}

        {/* Buttons */}
        <div className="pt-4 flex gap-4 bg-white sticky bottom-0 border-t border-gray-100 py-3">
          <div className="flex-1">
            <Button text="Back" borderButton onclick={onBack} />
          </div>
          <div className="flex-1">
            <Button
              text={isSubmitting ? "Sending..." : "Save & Send Documents"}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProviderFormFillStep;
