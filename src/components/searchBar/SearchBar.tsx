
import { FiSearch } from "react-icons/fi";
interface SearchBarProps {
    sm?: boolean
}
const SearchBar: React.FC<SearchBarProps> = ({ sm = false }) => {
    return (
        <div className={`   m-auto  rounded-full borderClass flex items-center gap-x-2 ${sm ? "px-2 py-0.5 lg:py-1" : "px-3 py-1 lg:py-2"}`}>
            <FiSearch className='text-lightGreyColor' size={`${sm ? 15 : 20}`} />
            <input className='outline-none w-full ' placeholder='Search here...' />
        </div>
    )
}

export default SearchBar