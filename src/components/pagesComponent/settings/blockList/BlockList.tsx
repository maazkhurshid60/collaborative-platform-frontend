import { useEffect, useState } from 'react'
import SearchBar from '../../../searchBar/SearchBar'
import BlockUserAccount from './Block/BlockUserAccount';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { isBlockScreenShowReducer } from '../../../../redux/slices/BlockListUserSlice';
import { blockListDataType } from '../../../../types/usersType/UsersType';

interface BlockListProps {
    blockListData?: blockListDataType[]
}

const BlockList: React.FC<BlockListProps> = (props) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        setShowSidebar(true);

    }, []);

    const filteredBlockList = props.blockListData?.filter((data) =>
        data?.fullName?.toLowerCase().includes(searchValue.toLowerCase())
    );
    return (
        <div className='absolute top-0 z-50 left-0 w-full h-[100vh] bg-textColor/70 flex items-center justify-end'
            onClick={() => dispatch(isBlockScreenShowReducer(false))}
        >

            <div
                className={` bg-white  p-4 relative  transform transition-transform duration-700 ease-in-out ${showSidebar ? 'translate-x-0' : 'translate-x-full hidden'}`}
            >




                <div className='mt-4'>
                    <SearchBar sm value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                </div>
                <div className='h-[89vh] overflow-auto'>
                    {filteredBlockList && filteredBlockList?.length > 0 ? (
                        filteredBlockList.map((data, id: number) => (

                            <BlockUserAccount fullName={data?.fullName} id={data?.id} key={id} profileImage={data?.profileImage ?? null} />
                        ))
                    ) : (
                        <div className='text-center text-sm text-textGreyColor mt-10'>
                            No record found.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default BlockList;
