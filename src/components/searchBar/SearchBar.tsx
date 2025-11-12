
import { LuSearch } from "react-icons/lu";
interface SearchBarProps {
    sm?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    bgColor?: string
    borderRounded?: string
    isBorder?: boolean
    placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ sm = false, value, onChange, bgColor = "bg-white", borderRounded = "rounded-full", isBorder = true, placeholder = "Search here..." }) => {

    return (
        <div className={` m-auto ${borderRounded} ${isBorder && "borderClass"} flex items-center gap-x-2 ${sm ? "px-2 py-0.5 lg:py-1" : "px-3 py-1 lg:py-2"} ${bgColor}`}>
            <LuSearch className={`text-lightGreyColor opacity-100 `} size={sm ? 18 : 18} />
            <input
                className={`outline-none w-full placeholder:text-[10px] md:placeholder:text-[12px] lg:placeholder:text-[14px] `}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default SearchBar;
