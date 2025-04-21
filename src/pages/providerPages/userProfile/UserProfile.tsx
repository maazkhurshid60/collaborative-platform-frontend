
;
import OutletLayout from '../../../layouts/outletLayout/OutletLayout';
import LabelData from '../../../components/labelText/LabelData';
import Button from '../../../components/button/Button';
import { useState } from "react";
import DeleteIcon from "../../../components/icons/delete/DeleteIcon";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../../../components/inputField/InputField";
import Dropdown from "../../../components/dropdown/Dropdown";
import { toast } from "react-toastify";
import DeleteClientModal from "../../../components/modals/providerModal/deleteClientModal/DeleteClientModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice";
import { providerSchema } from "../../../schema/providerSchema/ProviderSchema";
import UserIcon from '../../../components/icons/user/User';
import BackIcon from '../../../components/icons/back/Back';
type FormFields = z.infer<typeof providerSchema>;

const departmentOptions = [
    { value: "nutritionist", label: "Nutritionist" },
    { value: "psychiatrist", label: "Psychiatrist" },
    { value: "therapist", label: "Therapist" },
    { value: "eyeSpecialist", label: "Eye Specialist" },
    { value: "heartSpecialist", label: "Heart Specialist" },
]
const UserProfile = () => {
    const [isEdit, setIsEdit] = useState(false)
    const isShowDeleteModal = useSelector((state: RootState) => state.modalSlice.isModalDelete)
    const dispatch = useDispatch()
    const {
        register,
        handleSubmit,
        formState: { errors }, control
    } = useForm<FormFields>({
        resolver: zodResolver(providerSchema),
    });

    const updateFunction = (data: FormFields) => {
        console.log(data);
        toast.success("User has updated successfully")
        setIsEdit(false)

    }
    return (
        <OutletLayout heading='User profile'>
            {isEdit && <div className='relative'>
                <div className='absolute  -left-6 -top-12 md:-top-14 lg:-left-5'>

                    <BackIcon onClick={() => setIsEdit(false)} />
                </div>
            </div>}
            {isShowDeleteModal && <DeleteClientModal />}

            {isEdit ?
                <form onSubmit={handleSubmit(updateFunction)} className="mt-6">
                    <div>
                        <LabelData label='User Image' />
                        <UserIcon className='text-6xl mt-2' />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
                        <div className=''>
                            <InputField required label='Full Name' register={register("fullName")} name='fullName' placeHolder='Enter Full Name.' error={errors.fullName?.message} />
                        </div>
                        <div className=''>
                            <InputField required
                                label='CNIC No'
                                register={register("cnic")}
                                name='cnic' placeHolder='Enter CNIC.'
                                error={errors.cnic?.message} />
                        </div>
                        <div className=''>
                            <InputField required label='Age' register={register("age")} name='age' placeHolder='Enter Age.' error={errors.age?.message} />
                        </div>
                        <div className=''>
                            <InputField required label='Email' register={register("email")} name='email' placeHolder='Enter Email.' error={errors.email?.message} />
                        </div>

                        <div className=''>
                            <InputField required label='Contact' register={register("contact")} name='contact' placeHolder='Enter contact.' error={errors.contact?.message} />
                        </div>

                        <div className=''>
                            <InputField required label='Address' register={register("address")} name='address' placeHolder='Enter Address.' error={errors.address?.message} />
                        </div>
                        <div className=''>
                            <Dropdown<FormFields>
                                name="department"
                                label="Profession"
                                control={control}
                                options={departmentOptions}
                                placeholder="Choose an option"
                                error={errors.department?.message}
                            />                </div>

                        <div className=' '>
                            <LabelData label='Your List of Active Clients' />
                            <ul className='text-[14px] font-medium text-textGreyColor list-disc ml-6'>
                                <li className="flex items-center gap-x-4">
                                    Client2
                                    <DeleteIcon onClick={() => dispatch(isModalDeleteReducer(true))} />
                                </li>
                                <li className="flex items-center gap-x-4">
                                    Client4
                                    <DeleteIcon onClick={() => dispatch(isModalDeleteReducer(true))} />

                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex items-center justify-end">

                        <div className='mt-10  w-[100px]'>

                            <Button text='Update' />
                        </div>
                    </div>
                </form>
                :
                <>
                    <div className='mt-6'>
                        <div>
                            <LabelData label='User Image' />
                            <UserIcon className='text-6xl mt-2' />
                        </div>

                        {/* <div className='flex items-center justify-between flex-wrap gap-y-10 mt-10'> */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-5 md:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10'>
                            <div className=''>
                                <LabelData label='Full Name' data='John Doe' />
                            </div>
                            <div className=''>
                                <LabelData label='CNIC Number' data='XXXXX-1234567-X' />
                            </div>
                            <div className=''>
                                <LabelData label='Age' data='41' />
                            </div>
                            <div className=''>
                                <LabelData label='Email' data='johnDoe@gmail.com' />
                            </div>
                            <div className=''>
                                <LabelData label='Contact No' data='0000-0000000' />
                            </div>
                            <div className=''>
                                <LabelData label='Address' data='123 House No, ABC Street, City' />
                            </div>
                            <div className=''>
                                <LabelData label='Profession' data='Physiotherapist' />
                            </div>
                            <div className=' '>
                                <LabelData label='Your List of Active Clients' />
                                <ul className='text-[14px] font-medium text-textGreyColor list-disc ml-6'>
                                    <li>Client2</li>
                                    <li>Client4</li>
                                </ul>
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


        </OutletLayout>
    )
}

export default UserProfile