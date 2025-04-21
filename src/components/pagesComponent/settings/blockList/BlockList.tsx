import { useEffect, useState } from 'react'
import SearchBar from '../../../searchBar/SearchBar'
import BlockUserAccount from './Block/BlockUserAccount';
import { IoIosArrowBack } from "react-icons/io";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { isBlockScreenShowReducer } from '../../../../redux/slices/BlockListUserSlice';


interface blockListDataType {
    name?: string
    isBlock?: boolean | string
    image?: string
}
interface BlockListProps {
    blockListData?: blockListDataType[]
}

const BlockList: React.FC<BlockListProps> = (props) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        setShowSidebar(true);

    }, []);

    return (
        <div className='absolute top-0 z-50 left-0 w-full h-[100vh] bg-textColor/70 flex items-center justify-end'>

            <div
                className={` bg-white h-screen p-4  transform transition-transform duration-700 ease-in-out ${showSidebar ? 'translate-x-0' : 'translate-x-full hidden'}`}
            ><IoIosArrowBack size={24} className='mb-4 absolute left-0 top-2 text-textGreyColor' onClick={() => { dispatch(isBlockScreenShowReducer(false)) }} />
                <div className='mt-4'>
                    <SearchBar sm />
                </div>
                <div>
                    {props?.blockListData?.map(data =>
                        <BlockUserAccount name={data?.name} image={data?.image} isBlock={data?.isBlock} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlockList;
