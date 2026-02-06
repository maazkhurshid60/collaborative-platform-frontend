import { useEffect, useMemo } from "react";
import { Country, State } from "country-state-city";
import { FieldError, useFormContext, useWatch } from "react-hook-form";
import Dropdown from "./Dropdown";

interface OptionType {
  label: string;
  value: string;
}

interface CountryStateSelectProps {
  defaultCountry?: string; // ISO2 like "US"
  defaultState?: string;   // state name (matches your current stateOption value)
  isCountryView: boolean;
  isStateView: boolean;
  required?: boolean;
  disable?: boolean;
}

type FormShape = {
  country: string;
  state: string;
};

const CountryStateSelect = ({
  defaultCountry,
  defaultState,
  isCountryView,
  isStateView,
  required = true,
  disable = false,
}: CountryStateSelectProps) => {
  const {
    control,
    setValue,
    getValues,
    formState: { errors, dirtyFields },
  } = useFormContext<FormShape>();

  const selectedCountry = useWatch({ control, name: "country" });

  // Countries: computed once
  const countryOptions: OptionType[] = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      label: c.name,
      value: c.isoCode,
    }));
  }, []);

  // States: recompute when country changes
  const stateOptions: OptionType[] = useMemo(() => {
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry).map((s) => ({
      label: s.name,
      value: s.name,
    }));
  }, [selectedCountry]);

  // Apply defaultCountry only if country is empty and user hasn't changed it
  useEffect(() => {
    if (!defaultCountry) return;
    const current = getValues("country");
    if (!current && !dirtyFields.country) {
      setValue("country", defaultCountry, { shouldValidate: true });
    }
  }, [defaultCountry, dirtyFields.country, getValues, setValue]);

  // When country changes, clear state if it's not valid for the new country
  useEffect(() => {
    const currentState = getValues("state");
    if (!selectedCountry) {
      if (currentState) setValue("state", "", { shouldDirty: true, shouldValidate: true });
      return;
    }

    if (currentState && !stateOptions.some((s) => s.value === currentState)) {
      setValue("state", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [getValues, selectedCountry, setValue, stateOptions]);

  // Apply defaultState only if it exists for selected country AND user hasn't touched state
  useEffect(() => {
    if (!defaultState) return;
    if (!selectedCountry) return;
    if (dirtyFields.state) return;

    const isValid = stateOptions.some((s) => s.value === defaultState);
    if (isValid && !getValues("state")) {
      setValue("state", defaultState, { shouldValidate: true });
    }
  }, [defaultState, dirtyFields.state, getValues, selectedCountry, setValue, stateOptions]);

  return (
    <div className="w-full">
      {isCountryView && (
        <div className="w-full">
          <Dropdown<FormShape>
            name="country"
            label="Country"
            control={control}
            options={countryOptions}
            placeholder="Select a country"
            error={errors?.country?.message as unknown as FieldError}
            required={required}
            disable={disable}
            // Side effect only: clear state when user selects a country
            onChange={() => {
              setValue("state", "", { shouldDirty: true, shouldValidate: true });
            }}
          />
        </div>
      )}

      {isStateView && (
        <div className="w-full">
          <Dropdown<FormShape>
            name="state"
            label="State"
            control={control}
            options={stateOptions}
            placeholder={selectedCountry ? "Select a state" : "Select country first"}
            error={errors?.state?.message as unknown as FieldError}
            required={required}
            disable={disable || !selectedCountry}
          />
        </div>
      )}
    </div>
  );
};

export default CountryStateSelect;
