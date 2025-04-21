
import OutletLayout from '../../../../layouts/outletLayout/OutletLayout'
import BackIcon from '../../../icons/back/Back'
import { useNavigate } from 'react-router-dom'
import Button from '../../../button/Button'
import InputField from '../../../inputField/InputField'
import Dropdown from '../../../dropdown/Dropdown'
import LabelData from '../../../labelText/LabelData'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clientSchema } from '../../../../schema/clientSchema/ClientSchema'
import { statusOption } from '../../../../constantData/statusOptions'
import UserIcon from '../../../icons/user/User'
type FormFields = z.infer<typeof clientSchema>

const AddClient = () => {
    const { register, control, formState: { errors }, handleSubmit } = useForm<FormFields>({ resolver: zodResolver(clientSchema) })
    const navigate = useNavigate()

    const addFunction = (data: FormFields) => {
        console.log(data);

    }
    return (
        <OutletLayout heading='Add Client'>
            <div className='relative'>
                <div className='absolute  -left-6 -top-12 md:-top-14 lg:-left-5'>

                    <BackIcon onClick={() => navigate("/clients")} />
                </div>
            </div>
            <form onSubmit={handleSubmit(addFunction)} className="mt-6">
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
                            name="status"
                            label="Profession"
                            control={control}
                            options={statusOption}
                            placeholder="Choose an option"
                            error={errors.status?.message}
                        />                </div>


                </div>
                <div className="flex items-center justify-end">

                    <div className='mt-10  w-[100px]'>

                        <Button text='Add' />
                    </div>
                </div>
            </form>
        </OutletLayout>
    )
}

export default AddClient