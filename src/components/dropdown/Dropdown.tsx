import { useEffect, useRef, useState } from "react";
import {
    Controller,
    Control,
    FieldError,
    FieldValues,
    Path,
} from "react-hook-form";

interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps<T extends FieldValues> {
    name: Path<T>;
    label: string;
    control?: Control<T>;
    options: DropdownOption[];
    placeholder?: string;
    error?: string | FieldError;
    datatestid?: string;
    onChange?: (selectedOption: DropdownOption) => void;
    required?: boolean
    disable?: boolean
}

const Dropdown = <T extends FieldValues>({
    name,
    label,
    control,
    options,
    placeholder = "Select an option",
    error,
    datatestid,
    onChange,
    required = false,
    disable = false
}: DropdownProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const catMenu = useRef<HTMLDivElement>(null)

    const toggleDropdown = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevents event from bubbling up

        if (disable === false) {

            setIsOpen((prev) => !prev);
        }
    };
    const closeDropdown = () => setIsOpen(false);

    // Sort options alphabetically by label
    const sortedOptions = [...options].sort((a, b) =>
        a.label.localeCompare(b.label)
    );

    // Filter options based on search term
    const filteredOptions = sortedOptions.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const closeOpenMenus = (event: MouseEvent) => {
        if (
            catMenu.current &&
            !catMenu.current.contains(event.target as Node) &&
            !(event.target as HTMLElement).closest("input")
        ) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', closeOpenMenus)
        return () => {
            document.removeEventListener('mousedown', closeOpenMenus)
        }

    }, [])

    return (
        <div className="relative ">
            <div className="flex mb-1">
                <p className="labelMedium">{label}</p>
                {required && <p className="errorText ml-1">*</p>}
            </div>

            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <div>
                        <div
                            className={` bg-inputBgColor  rounded-md p-2 cursor-pointer flex justify-between items-center`}
                            onClick={toggleDropdown}
                            ref={catMenu}

                        >
                            <span className="text-gray-700" data-testid={datatestid}>
                                {field.value
                                    ? sortedOptions.find((opt) => opt.value === field.value)
                                        ?.label
                                    : placeholder}
                            </span>
                            <svg
                                className={`w-5 h-5 transform transition-transform  duration-500 ${isOpen ? "rotate-180" : "rotate-0"
                                    }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>

                        <div
                            className={`absolute bg-white border border-gray-300 rounded-md mt-1 w-full shadow-md z-10 transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 border-b border-gray-300 focus:outline-none text-sm"
                            />

                            <ul className="h-auto max-h-[127px] overflow-auto">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option) => (
                                        <li
                                            key={option.label}
                                            data-testid={`dropdown-option-${option.value}`}
                                            className="p-2 hover:bg-gray-100 cursor-pointer text-textColor text-sm"
                                            onClick={() => {
                                                field.onChange(option.value);
                                                if (onChange) {
                                                    onChange(option);
                                                }
                                                closeDropdown();
                                                setSearchTerm(""); // Reset search on selection
                                            }}
                                        >
                                            {option.label}
                                        </li>
                                    ))
                                ) : (
                                    <li className="p-2 text-gray-500 text-sm text-center">
                                        No results found
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            />
            {error && <p className="errorText text-left mt-1">{error.toString()}</p>} {/* Display error */}
        </div>
    );
};

export default Dropdown;







