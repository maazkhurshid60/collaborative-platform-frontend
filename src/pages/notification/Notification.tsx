
import OutletLayout from '../../layouts/outletLayout/OutletLayout'
import usePaginationHook from '../../hook/usePaginationHook'
import CustomPagination from '../../components/customPagination/CustomPagination'
import { FaRegUser } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from 'react-toastify';


const notificationData = [{
    name: "Client1",
    time: "2min ago",
    message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since"
},
{
    name: "Proiver1",
    time: "3min ago",
    message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since"
},
{
    name: "Provider2",
    time: "6min ago",
    message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since"
},
{
    name: "Client1",
    time: "8min ago",
    message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since"
},
{
    name: "Client2",
    time: "12min ago",
    message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since"
},
{
    name: "Client4",
    time: "20min ago",
    message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since"
},
{
    name: "Provider3",
    time: "22min ago",
    message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since"
},
{
    name: "Client1",
    time: "25min ago",
    message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since"
},
{
    name: "Client1",
    time: "27min ago",
    message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since"
},
{
    name: "Client1",
    time: "29min ago",
    message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since"
},]


const Notification = () => {
    const { totalPages,
        getCurrentRecords,
        handlePageChange, currentPage,
    } = usePaginationHook({ data: notificationData, recordPerPage: 4 })
    return (
        <OutletLayout heading='Notifications'>
            {getCurrentRecords()?.map(data => <div className='flex items-center justify-between font-[Poppins] mb-4 mt-4 text-textGreyColor border-b-[1px] border-b-solid border-b-textGreyColor pb-4'>
                <div className='flex items-start gap-x-4'>
                    <FaRegUser size={24} />
                    <div className='w-[100%] sm:w-[80%] md:w-[70%] lg:w-[60%]'>
                        <div className='flex items-center justify-between gap-x-5'>
                            <div className='flex items-center gap-x-4'>
                                <p className='font-semibold text-[14px] md:text-[16px] lg:text-[18px] text-textColor'>{data?.name}</p>
                                <p className='font-semibold text-[18px]'>.</p>
                                <p className='font-light text-[10px] lg:text-[12px] '>{data?.time}</p>
                                {/* <p className=' font-semibold text-[18px]'>.</p>
                                <p className='font-light  text-[10px] lg:text-[12px] cursor-pointer'>Mark as Read</p> */}

                            </div>
                            <AiOutlineDelete className='text-redColor cursor-pointer block sm:hidden' size={18} onClick={() => toast.success("This feature is comming soon.")
                            } />
                        </div>
                        <p className=' text-[12px] lg:text-[14px] '>{data?.message}</p>
                    </div>
                </div>
                <AiOutlineDelete className='text-redColor cursor-pointer hidden sm:block sm:text-[26px] md:text-[30px] lg:text-[20px]' />
            </div>)}
            <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} />

        </OutletLayout>)
}

export default Notification