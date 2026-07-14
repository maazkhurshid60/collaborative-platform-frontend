
import { LuSearch } from "react-icons/lu";
import { IoClose } from "react-icons/io5";

interface SearchBarProps {
    sm?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear?: () => void;
    bgColor?: string
    borderRounded?: string
    isBorder?: boolean
    placeholder?: string
    showClearButton?: boolean;
    disabled?: boolean;
    autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
    sm = false, 
    value, 
    onChange, 
    onClear,
    bgColor = "bg-white", 
    borderRounded = "rounded-lg", 
    isBorder = true, 
    placeholder = "Search here...",
    showClearButton = false,
    disabled = false,
    autoFocus = false
}) => {

    return (
        <div className={`relative m-auto ${borderRounded} ${isBorder && "border border-gray-300 focus-within:border-primaryColorDark"} flex items-center gap-x-2 ${sm ? "px-3 py-2" : "px-4 py-2.5"} ${bgColor} transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <LuSearch className={`hidden text-lightGreyColor flex-shrink-0 ${sm ? 'text-sm' : 'text-base'}`} size={sm ? 16 : 18} />
            <input
                className={`outline-none w-full placeholder:text-gray-400 text-sm md:text-base bg-transparent ${disabled ? 'cursor-not-allowed' : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                autoFocus={autoFocus}
            />
            {showClearButton && value && (
                <button
                    onClick={onClear}
                    className="text-lightGreyColor hover:text-gray-600 transition-colors duration-200 flex-shrink-0"
                    type="button"
                >
                    <IoClose size={18} />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
