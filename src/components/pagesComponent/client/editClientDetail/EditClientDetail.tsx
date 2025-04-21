import Button from '../../../button/Button'
import InputField from '../../../inputField/InputField'
import Dropdown from '../../../dropdown/Dropdown'
import LabelData from '../../../labelText/LabelData'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clientSchema } from '../../../../schema/clientSchema/ClientSchema'
import { statusOption } from '../../../../constantData/statusOptions'
import { clientData } from '../../../../pages/providerPages/clients/DummyData'
import { useEffect } from 'react'
import DeleteIcon from '../../../icons/delete/DeleteIcon'
import { isModalDeleteReducer } from '../../../../redux/slices/ModalSlice'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../redux/store'
import DeleteClientModal from '../../../modals/providerModal/deleteClientModal/DeleteClientModal'
import UserIcon from '../../../icons/user/User'
type FormFields = z.infer<typeof clientSchema>
interface EditClientDetailProps {
    id?: string | number
}
const EditClientetails: React.FC<EditClientDetailProps> = ({ id }) => {

    const isShowDeleteModal = useSelector((state: RootState) => state.modalSlice.isModalDelete)
    const data = clientData?.filter((_, index) => index === parseInt(id?.toString() ?? "0")
    )
    const { register, control, formState: { errors }, handleSubmit, setValue } = useForm<FormFields>({ resolver: zodResolver(clientSchema) })
    const dispatch = useDispatch<AppDispatch>()
    const updateFunction = (data: FormFields) => {
        console.log(data);
    }

    console.log(data[0], id);

    useEffect(() => {
        if (data) {
            setValue("cnic", data[0]?.cnic)
            setValue("email", data[0]?.email)
            setValue("fullName", data[0]?.name)
            setValue("status", data[0]?.status)
            setValue("address", data[0]?.address)
            setValue("contact", data[0]?.contact)
            setValue("age", data[0]?.age)
        }
    }, [id])
    return (
        <div className='relative pl-2'>
            {isShowDeleteModal && <DeleteClientModal />}

            <form onSubmit={handleSubmit(updateFunction)} className="mt-6">
                <div>
                    <LabelData label='User Image' />
                    <UserIcon className='text-6xl mt-2' />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
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
                            name="status"
                            label="Status"
                            control={control}
                            options={statusOption}
                            placeholder="Choose an option"
                            error={errors.status?.message}
                        />
                    </div>
                    <div className=' '>
                        <LabelData label='Your List of Active Providers' />
                        <ul className='text-[14px] font-medium text-textGreyColor list-disc ml-6'>
                            {data[0]?.providers?.map(data => <li className='flex items-center gap-x-4'>{data}

                                <DeleteIcon onClick={() => dispatch(isModalDeleteReducer(true))} />

                            </li>)}

                        </ul>
                    </div>

                </div>
                <div className="flex items-center justify-end">

                    <div className='mt-10  w-[100px]'>

                        <Button text='Update' />
                    </div>
                </div>
            </form>
        </div>)
}

export default EditClientetails