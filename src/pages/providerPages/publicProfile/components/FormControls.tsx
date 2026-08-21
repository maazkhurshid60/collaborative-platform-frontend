import React from "react";
import { Controller, type Control, type UseFormRegisterReturn } from "react-hook-form";
import type { ProfileFormState } from "../types";
import TagListInput from "../TagListInput";

export const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 drop-shadow-sm">
    <h2 className="text-[18px] font-bold text-[#101828] mb-5">{title}</h2>
    <div className="flex flex-col gap-5">{children}</div>
  </div>
);

export const TextField = ({
  label,
  registration,
  type = "text",
  multiline,
  placeholder,
}: {
  label: string;
  registration: UseFormRegisterReturn;
  type?: "text" | "number";
  multiline?: boolean;
  placeholder?: string;
}) => (
  <div>
    <label className="block text-[14px] font-medium text-[#333333] mb-2">
      {label}
    </label>
    {multiline ? (
      <textarea
        {...registration}
        rows={4}
        placeholder={placeholder}
        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[#2C9993]"
      />
    ) : (
      <input
        type={type}
        {...registration}
        placeholder={placeholder}
        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[#2C9993]"
      />
    )}
  </div>
);

export const TagListField = ({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<ProfileFormState>;
  name: keyof ProfileFormState;
  label: string;
  placeholder?: string;
}) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <TagListInput
        label={label}
        values={field.value as string[]}
        onChange={field.onChange}
        placeholder={placeholder}
      />
    )}
  />
);
