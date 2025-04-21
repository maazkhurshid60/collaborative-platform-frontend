import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { useState } from 'react';
import { toast } from 'react-toastify';
import { isModalShowReducser } from '../../../../redux/slices/ModalSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import UploadFile from '../../../inputField/UploadFile';
import { RxCross2 } from "react-icons/rx";

interface ViewDocModalProps {
    sharedDocs?: string
}

const ModalBodyContent: React.FC<{ docs: string }> = ({ docs }) => {
    const [isAgree, setIsAgree] = useState(false);
    const dispatch = useDispatch<AppDispatch>()
    const [signAdd, setSignAdd] = useState<string | null>(null);
    const submitFunction = () => {
        if (!isAgree) {
            toast.error("Please agree to the terms and conditions.");
            return;
        }

        if (!signAdd) {
            toast.error("Please upload your signature.");
            return;
        }
        const dataToBackend = { isAgree, docText: docs };
        console.log(dataToBackend);
        toast.success("This feature is comming soon.")

        dispatch(isModalShowReducser(false))
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSignAdd(imageUrl);
        }
    };
    return (
        <div className='mt-4'>
            <div className='h-[300px]  overflow-auto'>

                <p className="p-4 text-textColor">{docs}</p>
            </div>
            <div className='mt-4 mb-4'>
                <div className='flex items-center gap-x-2.5'>
                    <input type='checkbox' onChange={() => setIsAgree(!isAgree)} />
                    <p>I agree to the terms and condition mentioned above.</p>
                </div>
            </div>
            {signAdd ? <div className='relative'> <img
                src={signAdd}
                alt="Signature"
                className="m-auto min-h-[120px] max-h-[120px] object-contain rounded-md mb-4"
            />
                <RxCross2 className='absolute top-0 right-0 cursor-pointer' onClick={() => setSignAdd(null)} />
            </div> :
                <UploadFile onChange={handleFileChange} text='Add your signature here' heading='Sign here' />

            }

            <Button text='Submit' sm onclick={submitFunction} />
        </div>
    );
};

const ViewDocModal: React.FC<ViewDocModalProps> = ({ sharedDocs }) => {
    return (
        <ModalLayout
            heading='Privacy Policy Consent'
            modalBodyContent={<ModalBodyContent docs={sharedDocs ?? ""} />}
        />
    );
};

export default ViewDocModal;
