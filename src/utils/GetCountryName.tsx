import { Country } from 'country-state-city';


export const getCountryNameFromCode = (code: string) => {
    const country = Country.getCountryByCode(code);
    return country ? country.name : code;
};
