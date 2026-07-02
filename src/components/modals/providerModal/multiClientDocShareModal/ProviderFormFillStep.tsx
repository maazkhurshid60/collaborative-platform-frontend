import React, { useMemo } from "react";
import { useForm } from "react-hook-form";

import Button from "../../../button/Button";
import SignatureFormView from "../../../../pages/publicPages/formView/SignatureView";

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
  forms: { id: string; name: string; schema: { fields: FormSchemaField[] } }[];
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
    watch,
    formState: { errors },
  } = useForm();

  // Extract all fields that fall strictly under a provider-section
  const providerFields = useMemo(() => {
    const pFields: {
      formName: string;
      field: FormSchemaField;
      sectionTitle: string;
    }[] = [];

    for (const form of forms) {
      if (!form.schema?.fields) continue;

      let inProviderSection = false;
      let currentSectionTitle = "";

      for (const field of form.schema.fields) {
        if (field.type === "provider-section") {
          inProviderSection = true;
          currentSectionTitle = field.text || "For Provider Use Only";
          continue;
        } else if (field.type === "heading") {
          // If we hit a normal heading, we assume the provider section is over
          inProviderSection = false;
          currentSectionTitle = "";
          continue;
        }

        if (
          inProviderSection &&
          ["text", "date", "paragraph", "signature"].includes(field.type)
        ) {
          pFields.push({
            formName: form.name,
            field,
            sectionTitle: currentSectionTitle,
          });
        }
      }
    }

    return pFields;
  }, [forms]);

  if (providerFields.length === 0) {
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
      <p className="font-semibold text-[14px] mb-4">Fill Provider Sections</p>
      <p className="text-[12px] text-gray-500 mb-6">
        The selected forms contain sections for Provider Use Only. Please fill
        them out before sharing.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-h-[50vh] overflow-y-auto pr-2"
      >
        {providerFields.map(({ formName, field, sectionTitle }) => (
          <div
            key={field.id}
            className="space-y-2 p-3 bg-gray-50 rounded-lg border border-lightGreyColor"
          >
            <div className="mb-3 border-b border-lightGreyColor/50 pb-2">
              <p className="text-[10px] font-bold text-lightGreyColor uppercase tracking-wider">
                {formName}
              </p>
              <h4 className="text-sm font-bold text-amber-800">
                {sectionTitle}
              </h4>
            </div>

            <label className="block text-xs font-semibold text-amber-800">
              {field.label || field.text || "Field"}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === "text" && (
              <input
                type="text"
                {...register(field.id, { required: field.required })}
                className="w-full px-3 py-2 text-sm border border-primaryColorLight rounded-md focus:ring-primaryColorDark focus:border-primaryColorDark bg-white"
              />
            )}

            {field.type === "date" && (
              <input
                type="date"
                {...register(field.id, { required: field.required })}
                className="w-full px-3 py-2 text-sm border border-primaryColorLight rounded-md focus:ring-primaryColorDark focus:border-primaryColorDark bg-white"
              />
            )}

            {field.type === "paragraph" && (
              <textarea
                {...register(field.id, { required: field.required })}
                className="w-full px-3 py-2 text-sm border border-primaryColorLight rounded-md focus:ring-primaryColorDark focus:border-primaryColorDark min-h-20 bg-white"
              />
            )}

            {field.type === "signature" && (
              <SignatureFormView
                field={field as any}
                register={register}
                errors={errors}
                watch={watch}
              />
            )}

            {errors[field.id] && (
              <span className="text-red-500 text-[10px]">
                This field is required
              </span>
            )}
          </div>
        ))}

        <div className="pt-4 flex gap-4">
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
