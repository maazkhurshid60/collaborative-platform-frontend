
import { RxCross2 } from "react-icons/rx";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { isModalDeleteReducer, isModalShowReducser, isNewChatModalShowReducser, isNewGroupChatModalShowReducser } from '../../../redux/slices/ModalSlice';
interface ModalLayout {
    modalBodyContent: React.ReactNode
    heading: string
}
const ModalLayout: React.FC<ModalLayout> = (props) => {
    const dispatch = useDispatch<AppDispatch>()
    return (
        <div className='absolute left-0 top-0 bg-[#171717]/70 w-[100vw] h-[100vh] z-50 flex items-center justify-center'>
            <div className='w-[90%] md:w-[40%]'>

                <div className='bg-white w-[100%] p-5 pb-10  rounded-[20px]'>
                    {/* HEADER */}
                    <div className='flex items-center pb-4 border-b-[1px] border-b-greyColor border-b-solid'>
                        <div className='w-[100%]  text-center' >

                            <p className='text-center font-semibold text-[18px]'>{props.heading}</p>

                        </div>
                        <RxCross2 size={24} className='cursor-pointer' onClick={() => { dispatch(isModalShowReducser(false)); dispatch(isModalDeleteReducer(false)); dispatch(isNewChatModalShowReducser(false)); dispatch(isNewGroupChatModalShowReducser(false)) }} />
                    </div>
                    <div>
                        {props.modalBodyContent}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default ModalLayout