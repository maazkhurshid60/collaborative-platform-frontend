
import { FiSearch } from "react-icons/fi";
interface SearchBarProps {
    sm?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    bgColor?: string
    borderRounded?: string
    isBorder?: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({ sm = false, value, onChange, bgColor = "bg-white", borderRounded = "rounded-full", isBorder = true }) => {
    return (
        <div className={`m-auto ${borderRounded} ${isBorder && "borderClass"} flex items-center gap-x-2 ${sm ? "px-2 py-0.5 lg:py-1" : "px-3 py-1 lg:py-2"} ${bgColor}`}>
            <FiSearch className='text-lightGreyColor' size={sm ? 15 : 20} />
            <input
                className='outline-none w-full'
                placeholder='Search here...'
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default SearchBar;
