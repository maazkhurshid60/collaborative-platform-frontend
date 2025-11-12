// components/dropdowns/CountryStateSelect.ts
import { useEffect, useState } from 'react';
import { Country, State } from 'country-state-city';
import { FieldError, useFormContext } from 'react-hook-form';
import Dropdown from './Dropdown';

interface OptionType {
    label: string;
    value: string;
}

interface CountryStateSelectProps {
    defaultCountry?: string;
    defaultState?: string;
    isFlex?: boolean
    isCountryView: boolean
    isStateView: boolean
     required?: boolean;

}

const CountryStateSelect = ({ defaultCountry, defaultState, isCountryView, isStateView,  required = true, }: CountryStateSelectProps) => {
    const { control, watch, setValue, formState: { errors } } = useFormContext();

    const [countryOptions, setCountryOptions] = useState<OptionType[]>([]);
    const [stateOptions, setStateOptions] = useState<OptionType[]>([]);

    const selectedCountry = watch("country");
    console.log(errors, 'errors');
    // Populate country list
    useEffect(() => {
        const allCountries = Country.getAllCountries().map(c => ({
            label: c.name,
            value: c.isoCode
        }));
        setCountryOptions(allCountries);

        if (defaultCountry) {
            setValue("country", defaultCountry);
        }
    }, [defaultCountry]);

    // Populate state list based on selected/default country
    useEffect(() => {
        if (selectedCountry) {
            const states = State.getStatesOfCountry(selectedCountry).map(s => ({
                label: s.name,
                value: s.name
            }));
            setStateOptions(states);

            if (defaultState) {
                setValue("state", defaultState);
            } else {
                setValue("state", "");
            }
        }
    }, [selectedCountry, defaultState]);


    return (
        <div className={`w-full `}>
            {isCountryView &&
                <div className='w-[100%] '>

                    <Dropdown
                        name="country"
                        label="Country"
                        control={control}
                        options={countryOptions}
                        placeholder="Select a country"
                        error={errors?.country?.message as FieldError}
                        required={required}
                        onChange={(selected) => setValue("country", selected.value)}
                    />
                </div>
            }
            {
                isStateView &&
                <div className='w-[100%] '>

                    <Dropdown
                        name="state"
                        label="State"
                        control={control}
                        options={stateOptions}
                        placeholder={selectedCountry ? "Select a state" : "Select country first"}
                        error={errors?.state?.message as FieldError}
                        required={required}
                        disable={!selectedCountry}
                        onChange={(selected) => setValue("state", selected.value)}
                    />
                </div>
            }
        </div>

    );
};

export default CountryStateSelect;
