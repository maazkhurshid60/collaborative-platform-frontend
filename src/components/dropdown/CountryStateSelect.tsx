// import { useEffect, useMemo } from "react";
// import { Country, State } from "country-state-city";
// import { FieldError, useFormContext, useWatch } from "react-hook-form";
// import Dropdown from "./Dropdown";

// interface OptionType {
//   label: string;
//   value: string;
// }

// interface CountryStateSelectProps {
//   defaultCountry?: string; // ISO2 like "US"
//   defaultState?: string;   // state name (matches your current stateOption value)
//   isCountryView: boolean;
//   isStateView: boolean;
//   required?: boolean;
//   disable?: boolean;
// }

// type FormShape = {
//   //  country: string;
//   state: string;
// };

// const CountryStateSelect = ({
//   defaultCountry,
//   defaultState,
//   isCountryView,
//   isStateView,
//   required = true,
//   disable = false,
// }: CountryStateSelectProps) => {
//   const {
//     control,
//     setValue,
//     getValues,
//     formState: { errors, dirtyFields },
//   } = useFormContext<FormShape>();

//   // const selectedCountry = useWatch({ control,

//   //   name: "country" });

//   // Countries: restricted to United States only
//   const countryOptions: OptionType[] = useMemo(() => {
//     const us = Country.getCountryByCode("US");
//     if (!us) return [];
//     return [{
//       label: us.name,
//       value: us.isoCode,
//     }];
//   }, []);

//   // States: recompute when country changes
//   const stateOptions: OptionType[] = useMemo(() => {
//     if (!selectedCountry) return [];
//     return State.getStatesOfCountry(selectedCountry).map((s) => ({
//       label: s.name,
//       value: s.name,
//     }));
//   }, [selectedCountry]);

//   // Apply defaultCountry or "US" as default
//   useEffect(() => {
//     const current = getValues("country");
//     if (!current && !dirtyFields.country) {
//       setValue("country", defaultCountry || "US", { shouldValidate: true });
//     }
//   }, [defaultCountry, dirtyFields.country, getValues, setValue]);

//   // State clearing is handled gracefully by the Dropdown onChange to avoid race conditions on mount when both fields are prepopulated

//   // Apply defaultState only if it exists for selected country AND user hasn't touched state
//   useEffect(() => {
//     if (!defaultState) return;
//     //   if (!selectedCountry) return;
//     if (dirtyFields.state) return;

//     const isValid = stateOptions.some((s) => s.value === defaultState);
//     if (isValid && !getValues("state")) {
//       setValue("state", defaultState, { shouldValidate: true });
//     }
//   }, [defaultState, dirtyFields.state, getValues,
//     //selectedCountry,

//     setValue, stateOptions]);

//   return (
//     <div className="w-full">
//       {/* {isCountryView && (
//         <div className="w-full mb-1.5">
//           <Dropdown<FormShape>
//             //         name="country"
//             label="Country"
//             control={control}
//             options={countryOptions}
//             placeholder="Select a country"
//             required={required}
//             disable={disable}
//             // Side effect only: clear state when user selects a country
//             onChange={() => {
//               setValue("state", "", { shouldDirty: true });
//             }}
//           />
//         </div>
//       )} */}

//       {isStateView && (
//         <div className="w-full">
//           <Dropdown<FormShape>
//             name="state"
//             label="State"
//             control={control}
//             options={stateOptions}
//             placeholder={selectedCountry ? "Select a state" : "Select country first"}
//             required={required}
//             disable={disable || !selectedCountry}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default CountryStateSelect;



// import { useMemo } from "react";
// import { State } from "country-state-city";
// import { useFormContext } from "react-hook-form";
// import Dropdown from "./Dropdown";

// interface OptionType {
//   label: string;
//   value: string;
// }

// type FormShape = {
//   state: string;
// };

// const CountryStateSelect = ({
//   isStateView,
//   required = true,
//   disable = false,
// }: {
//   isStateView: boolean;
//   required?: boolean;
//   disable?: boolean;
// }) => {
//   const { control } = useFormContext<FormShape>();

//   // ✅ Always use US
//   const stateOptions: OptionType[] = useMemo(() => {
//     return State.getStatesOfCountry("US").map((s) => ({
//       label: s.name,
//       value: s.name,
//     }));
//   }, []);

//   return (
//     <div className="w-full">
//       {isStateView && (
//         <div className="w-full">
//           <Dropdown<FormShape>
//             name="state"
//             label="State"
//             control={control}
//             options={stateOptions}
//             placeholder="Select a state"
//             required={required}
//             disable={disable}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default CountryStateSelect;


import { useMemo } from "react";
import { State } from "country-state-city";
import { useFormContext } from "react-hook-form";
import Dropdown from "./Dropdown";

interface OptionType {
  label: string;
  value: string;
}

type FormShape = {
  state: string;
};

interface Props {
  isStateView: boolean;
  required?: boolean;
  disable?: boolean;
}

const CountryStateSelect = ({
  isStateView,
  required = true,
  disable = false,
}: Props) => {
  const { control } = useFormContext<FormShape>();

  // ✅ Always load US states
  const stateOptions: OptionType[] = useMemo(() => {
    return State.getStatesOfCountry("US").map((s) => ({
      label: s.name,
      value: s.name,
    }));
  }, []);

  return (
    <div className="w-full">
      {isStateView && (
        <Dropdown<FormShape>
          name="state"
          label="State"
          control={control}
          options={stateOptions}
          placeholder="Select a state"
          required={required}
          disable={disable}
        />
      )}
    </div>
  );
};

export default CountryStateSelect;