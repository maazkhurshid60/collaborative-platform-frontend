import { useState } from 'react'

import Button from '../../../button/Button'
import { IoDocumentTextOutline } from "react-icons/io5";
import ClientDocShareModal from '../../../modals/providerModal/clientDocShareModal/ClientDocShareModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { isModalShowReducser } from '../../../../redux/slices/ModalSlice';
import { FaRegShareFromSquare } from "react-icons/fa6";
import Checkbox from '../../../checkbox/Checkbox';

const docs = [{ name: "Privacy Policy", status: true }, { name: "What makes you think that you need help", status: false }, { name: "Consent Form", status: true }, { name: "Agreement", status: false }, { name: "Policies", status: true }]
const ShareClientDoc = () => {
    const dispatch = useDispatch<AppDispatch>()
    const [sharedDocs, setSharedDocs] = useState<string[]>()
    const completed = docs?.filter(data => data.status === true)
    const inCompleted = docs?.filter(data => data.status === false)
    const isShowModal = useSelector((state: RootState) => state.modalSlice.isModalShow)
    const selectDoc = (docName: string, isChecked: boolean) => {
        if (isChecked) {
            setSharedDocs(prev => [...(prev ?? []), docName]);
        } else {
            setSharedDocs(prev => (prev ?? []).filter(doc => doc !== docName));
        }
    };


    return (<>
        {isShowModal && <ClientDocShareModal sharedDocs={sharedDocs} />}
        <div className='relative pl-2'>

            <div className='mt-8 flex items-center justify-between mb-2' >
                <p className='font-semibold text-[14px] '>Needs to be Completed</p>
                <div className='w-[95px]'>

                    <Button text='Share' sm onclick={() => dispatch(isModalShowReducser(true))} icon={<FaRegShareFromSquare />} />
                </div>
            </div>
            <div className='grid  grid-cols-1 sm:grid-cols-2 gap-y-3'>
                {completed?.map(data => (
                    <div key={data.name} className='flex items-center gap-x-3 font-medium text-[14px]'>


                        <Checkbox
                            onChange={(e) => selectDoc(data.name, e.target.checked)}
                            checked={sharedDocs?.includes(data.name) ?? false}

                        />
                        <IoDocumentTextOutline className='text-primaryColorDark text-2xl' />
                        {data.name}
                    </div>
                ))}
            </div>

            <hr className='text-textGreyColor/30 h-[2px] mt-10 mb-10' />

            <div className='mt-8 flex items-center justify-between mb-2' >
                <p className='font-semibold text-[14px] '>Completed Documents</p>

            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3'>
                {inCompleted?.map(data => <div className=' flex items-center gap-x-3 font-medium text-[14px] '> <IoDocumentTextOutline className='text-primaryColorDark text-2xl' />{data?.name}</div>)}
            </div>
        </div>
    </>
    )
}

export default ShareClientDoc