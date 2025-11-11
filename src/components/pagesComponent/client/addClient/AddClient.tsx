/* eslint-disable @typescript-eslint/no-unused-vars */

import OutletLayout from '../../../../layouts/outletLayout/OutletLayout'
import BackIcon from '../../../icons/back/Back'
import { useNavigate } from 'react-router-dom'
import Button from '../../../button/Button'
import InputField from '../../../inputField/InputField'
import Dropdown from '../../../dropdown/Dropdown'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clientSchema } from '../../../../schema/clientSchema/ClientSchema'
import { statusOption } from '../../../../constantData/statusOptions'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import clientApiService from '../../../../apiServices/clientApi/ClientApi'
import { useState } from 'react'
import Loader from '../../../loader/Loader'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../redux/store'
import Checkbox from '../../../checkbox/Checkbox'
import CountryStateSelect from '../../../dropdown/CountryStateSelect'
type FormFields = z.infer<typeof clientSchema>

const AddClient = () => {
    const methods = useForm<FormFields>({
        resolver: zodResolver(clientSchema),
    });

    const { register, handleSubmit, formState: { errors }, control } = methods; const navigate = useNavigate()
    const [isLoader, setIsLoader] = useState(false)
    const queryClient = useQueryClient()
    const providerId = useSelector((state: RootState) => state.LoginUserDetail.userDetails.id)
    const [wantToBeSeen, setWantToBeSeen] = useState(true);
    // const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Callback for when file is selected
    // const handleFileSelect = (file: File) => {
    //     setSelectedFile(file);
    //     const previewURL = URL.createObjectURL(file);
    //     setImagePreview(previewURL);
    // };
    const handleCheckboxChange = () => {
        setWantToBeSeen((prev) => !prev);
    };
    const addFunction = (data: FormFields) => {
        // if (selectedFile === null) {
        //     return toast.error("Profile Image is required");

        // }
        updateMutation.mutate(data)
    }


    const updateMutation = useMutation({

        mutationFn: async (data: FormFields) => {
            const formData = new FormData();

            formData.append("fullName", data?.fullName);
            formData.append("licenseNo", data?.licenseNo);
            formData.append("age", data?.age?.toString() ?? '');
            formData.append("email", data?.email);
            formData.append("contactNo", data?.contactNo);
            formData.append("address", data?.address ?? '');
            formData.append("gender", data?.gender ?? 'Male');
            formData.append("status", data?.status ?? 'active');
            formData.append("isAccountCreatedByOwnClient", "false");
            formData.append("role", "client");
            formData.append("isApprove", "pending");
            formData.append("country", data?.country ?? '');
            formData.append("state", data?.state);
            formData.append("providerId", providerId);
            formData.append("clientShowToOthers", wantToBeSeen.toString());

            // if (selectedFile) {
            //     formData.append("profileImage", selectedFile);
            // }
            await clientApiService.addClientApi(formData);
        },
        onMutate: () => {
            setIsLoader(true);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success("New Client has added successfully")
            navigate("/clients")
            setIsLoader(false)
        },
        onError: () => {
            // toast.error('Failed to add the client!');
            setIsLoader(false)
        },

    });

    return (
        <OutletLayout heading='Add Client'>
            {isLoader && <Loader text='Adding...' />}

            <div className='relative'>
                <div className='absolute  -left-2 -top-14 md:-top-23.5 md:-left-2.5 lg:-left-5 lg:-top-14'>

                    <BackIcon onClick={() => navigate(-1)} />
                </div>
            </div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(addFunction)} className="mt-6">
                    {/* <div>
                        <LabelData label='Upload Image' required />
                        <UserIcon this is comment className='text-6xl mt-2' onClick={() => toast.success("This feature is comming soon.")} />
                        {imagePreview ? (

                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="mt-4 w-24 h-24 object-cover rounded-lg"

                            />
                        ) :

                            <FileUploader onFileSelect={handleFileSelect} />

                        }
                    </div> */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
                        <div className=''>
                            <InputField required label='Full Name' register={register("fullName")} placeHolder='Enter Full Name.' error={errors.fullName?.message} />
                        </div>
                        <div className=''>
                            <Dropdown<FormFields>
                                name="gender"
                                label="Gender"
                                control={control}
                                options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]}
                                placeholder="Choose an option"
                                error={errors.gender?.message}
                            />
                        </div>

                        <div className=''>
                            <InputField label='Age' register={register("age")} placeHolder='Enter Age.' error={errors.age?.message} />
                        </div>
                        <div className=''>
                            <InputField required
                                type='number'
                                label='license Number'
                                register={register("licenseNo")}
                                placeHolder='Enter licenseNo.'
                                error={errors.licenseNo?.message} />
                        </div>
                        <div className=''>
                            <InputField required label='Email' register={register("email")} placeHolder='Enter Email.' error={errors.email?.message} />
                        </div>

                        <div className=''>
                            <InputField required label='Contact Number' type='number' register={register("contactNo")} placeHolder='Enter contact.' error={errors.contactNo?.message} />
                        </div>



                        <div className=''>
                            <InputField label='Address' register={register("address")} placeHolder='Enter Address.' error={errors.address?.message} />
                        </div>
                        <CountryStateSelect isCountryView={true} isStateView={false}  required={false} />
                        <CountryStateSelect isCountryView={false} isStateView={true} />
                        <div className=''>
                            <Dropdown<FormFields>
                                name="status"
                                label="Status"
                                control={control}
                                options={statusOption}
                                placeholder="Choose an option"
                                error={errors.status?.message}
                            />                </div>


                    </div>
                    <div className='mt-8'
                    >
                        <Checkbox
                            text="Want to be seen by different providers for this client"
                            checked={wantToBeSeen}
                            onChange={handleCheckboxChange}
                        />
                    </div>
                    <div className="flex items-center justify-end">

                        <div className='mt-10  w-[100px]'>

                            <Button text='Save' />
                        </div>
                    </div>
                </form>
            </FormProvider>
        </OutletLayout>
    )
}

export default AddClient


