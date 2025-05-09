
;
import OutletLayout from '../../../layouts/outletLayout/OutletLayout';
import LabelData from '../../../components/labelText/LabelData';
import Button from '../../../components/button/Button';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../../../components/inputField/InputField";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice";
import DeleteAccountModal from '../../../components/modals/clientModal/deleteAccountModal/DeleteAccountModal';
import { accountSchema } from '../../../schema/clientSchema/ClientSchema';
import BackIcon from '../../../components/icons/back/Back';
import UploadFile from '../../../components/inputField/UploadFile';
import { RxCross2 } from 'react-icons/rx';
import { AiOutlineDelete } from 'react-icons/ai';

type FormFields = z.infer<typeof accountSchema>;


const Settings = () => {
    const [isEdit, setIsEdit] = useState(false)
    const [signAdd, setSignAdd] = useState<string | null>(null);

    const isShowDeleteModal = useSelector((state: RootState) => state.modalSlice.isModalDelete)
    const dispatch = useDispatch()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(accountSchema),
    });

    const updateFunction = (data: FormFields) => {
        if (!signAdd) {
            return toast.error("Please upload your signature.");

        }
        console.log(data);
        toast.success("This feature is comming soon.")
        setIsEdit(false)

    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSignAdd(imageUrl);
        }
    };
    return (
        <OutletLayout heading='Account Settings' button={!isEdit && <Button icon={<AiOutlineDelete size={18} className="text-white" />
        } text='Delete Account' onclick={() => dispatch(isModalDeleteReducer(true))} />}>
            {isEdit && <div className='relative'>
                <div className='absolute  -left-6 -top-12 md:-top-14 lg:-left-5'>

                    <BackIcon onClick={() => setIsEdit(false)} />
                </div>
            </div>}
            {isShowDeleteModal && <DeleteAccountModal />}
            <p className='font-bold mt-6'>General Settings</p>
            {isEdit ?
                <form onSubmit={handleSubmit(updateFunction)} className="mt-2">

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-5 sm:gap-y-6 md:gap-y-4 mt-5 md:mt-4">
                        <div className=''>
                            <InputField required label='Full Name' register={register("fullName")} name='fullName' placeHolder='Enter Full Name.' error={errors.fullName?.message} />
                        </div>
                        <div className=''>
                            <InputField required
                                label='CNIC Number'
                                register={register("cnic")}
                                name='cnic' placeHolder='Enter CNIC.'
                                error={errors.cnic?.message} />
                        </div>

                        <div className=''>
                            <InputField required label='Email ID' register={register("email")} name='email' placeHolder='Enter Email.' error={errors.email?.message} />
                        </div>

                        <div className=''>
                            <InputField required label='Password' register={register("password")} name='password' placeHolder='Enter Password.' error={errors.password?.message} />
                        </div>
                    </div>
                    <hr className='w-[100%] h-[1px] text-greyColor mt-10' />
                    <div className='w-[300px] mt-10'>
                        <p className='font-semibold mb-2'>E-Signature</p>

                        {signAdd ? <div className='relative'> <img
                            src={signAdd}
                            alt="Signature"
                            className="m-auto max-h-[120px] object-contain rounded-md mb-4"
                        />
                            <RxCross2 className='absolute top-0 right-0 cursor-pointer' onClick={() => setSignAdd(null)} />
                        </div> :
                            <UploadFile onChange={handleFileChange} text='Add your signature here' heading='Sign here' />

                        }                    </div>
                    <div className="flex items-center justify-end">

                        <div className='mt-10  w-[100px]'>

                            <Button text='Update' />
                        </div>
                    </div>
                </form >
                :
                <>
                    <div className=''>


                        {/* <div className='flex items-center justify-between flex-wrap gap-y-10 mt-10'> */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-5 md:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-4 mt-5 md:mt-4'>
                            <div className=''>
                                <LabelData label='Full Name' data='John Doe' />
                            </div>
                            <div className=''>
                                <LabelData label='CNIC Number' data='XXXXX-1234567-X' />
                            </div>

                            <div className=''>
                                <LabelData label='Email ID' data='johnDoe@gmail.com' />
                            </div>

                            <div className=''>
                                <LabelData label='Password' data='************' />
                            </div>


                        </div>

                    </div>
                    <div className='flex items-center justify-end w-full'>
                        <div className='w-[100px]'>
                            <Button text='Edit' sm onclick={() => setIsEdit(true)} />
                        </div>

                    </div>
                </>
            }


        </OutletLayout >
    )
}

export default Settings