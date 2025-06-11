import { useEffect, useState } from 'react';
import { RiArrowLeftDoubleLine, RiArrowRightDoubleFill, RiArrowLeftSLine } from "react-icons/ri";
import ToolTip from '../toolTip/ToolTip';

interface PaginationProps {
  totalPages: number;
  onPageChange: (page: number) => void;
  hookCurrentPage: number
}

const CustomPagination: React.FC<PaginationProps> = ({ totalPages, onPageChange, hookCurrentPage }) => {

  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange(page); // Notify parent about page change
  };



  useEffect(() => {
    if (hookCurrentPage !== undefined) {
      setCurrentPage(hookCurrentPage)
    }
  }, [hookCurrentPage])

  return (
    <div className="w-full flex justify-center items-center gap-x-4 sm:justify-end mt-1 mb-2 p-3 font-[Poppins] text-textGreyColor text-[16px] font-medium">
      <p className='text-[10px] md:text-[14px] lg:text-[16px]'>Showing Pages {currentPage} Of {totalPages}</p>
      <nav aria-label="Page navigation example">
        <ul className="inline-flex -space-x-px text-base">
          {/* Previous Button with Arrow Icon */}
          <li>
            <div className='relative group'>

              <RiArrowLeftDoubleLine size={24} onClick={() => currentPage !== 1 && handlePageChange(1)}

                className={`flex items-center justify-center  leading-tight bg-transparent rounded-s-lg 
                hover:bg-primaryColor hover:text-primaryColorDark font-inter text-[13px]
                ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} />
              <ToolTip toolTipText='first record' />

            </div>
          </li>

          <li>
            <div className='relative group'>

              <RiArrowLeftSLine size={24} onClick={() => currentPage !== 1 && handlePageChange(currentPage - 1)}
                className={`flex items-center justify-center  leading-tight bg-transparent rounded-s-lg 
                hover:bg-primaryColor hover:text-primaryColorDark font-inter text-[13px] 
                ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} />
              <ToolTip toolTipText='previous record' />

            </div>

          </li>

          {/* Page Numbers */}
          <p> {currentPage}</p>
          {/* Next Button with Arrow Icon */}
          <li>
            <div className='relative group'>


              <RiArrowLeftSLine size={24} onClick={() => currentPage !== totalPages && handlePageChange(currentPage + 1)}

                className={`flex items-center justify-center bg-transparent rotate-[180deg]  leading-tight rounded-s-lg 
  hover:bg-primaryColor hover:text-primaryColorDark font-inter text-[13px]
  ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} />
              <ToolTip toolTipText='next record' />

            </div>
          </li>
          <li>

            <div className='relative group'>

              <RiArrowRightDoubleFill size={24} onClick={() => currentPage !== totalPages && handlePageChange(totalPages)}
                className={`flex items-center justify-center   leading-tight bg-transparent   rounded-s-lg 
                hover:bg-primaryColor hover:text-primaryColorDark font-inter text-[13px]
                ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} />
              <ToolTip toolTipText='last record' />
            </div>
          </li>




        </ul>
      </nav>
    </div>
  );
};

export default CustomPagination;
