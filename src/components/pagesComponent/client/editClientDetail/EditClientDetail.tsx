import Button from '../../../button/Button'
import InputField from '../../../inputField/InputField'
import Dropdown from '../../../dropdown/Dropdown'
import LabelData from '../../../labelText/LabelData'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clientSchema } from '../../../../schema/clientSchema/ClientSchema'
import { statusOption } from '../../../../constantData/statusOptions'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../redux/store'
import DeleteClientModal from '../../../modals/providerModal/deleteClientModal/DeleteClientModal'
import { ClientType, Provider } from '../../../../types/clientType/ClientType'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import clientApiService from '../../../../apiServices/clientApi/ClientApi'
import { toast } from 'react-toastify'
import Loader from '../../../loader/Loader'
import { GoDotFill } from 'react-icons/go'
import Checkbox from '../../../checkbox/Checkbox'
import CountryStateSelect from '../../../dropdown/CountryStateSelect'

// Adjust the import path if needed

type FormFields = z.infer<typeof clientSchema>

interface EditClientDetailProps {
    clientData?: ClientType
}

const EditClientetails: React.FC<EditClientDetailProps> = ({ clientData }) => {
    const isShowDeleteModal = useSelector((state: RootState) => state.modalSlice.isModalDelete)

    const methods = useForm<FormFields>({
        resolver: zodResolver(clientSchema),
    });

    const {
        register,
        handleSubmit,
        formState: { errors }, control,
        setValue
    } = methods;
    const queryClient = useQueryClient()
    const [isLoader, setIsLoader] = useState(false)
    // const [showUploader, setShowUploader] = useState(false)
    // const [selectedFile, setSelectedFile] = useState<File | string | null>(null)
    // const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [wantToBeSeen, setWantToBeSeen] = useState(true);
    const handleCheckboxChange = () => {
        setWantToBeSeen((prev) => !prev);
    };
    useEffect(() => {

        if (clientData) {
            setValue("licenseNo", clientData?.user?.licenseNo ?? "")
            setValue("email", clientData?.email ?? "")
            setValue("fullName", clientData?.user?.fullName ?? "")
            setValue("status", clientData?.user?.status ?? "")
            setValue("address", clientData?.user?.address ?? "")
            setValue("contactNo", clientData?.user?.contactNo ?? "")
            setValue("age", parseInt(clientData?.user?.age ?? ""))
            setValue("gender", clientData?.user?.gender ?? "")
            setValue("country", clientData?.user?.country ?? "")
            setValue("state", clientData?.user?.state ?? "")
            setWantToBeSeen(clientData?.clientShowToOthers ?? false)

            // if (clientData?.user?.profileImage !== "null" && clientData?.user?.profileImage !== null) {

            //     const imagePath = clientData?.user?.profileImage ? clientData?.user?.profileImage : null;
            //     setPreviewUrl(imagePath)
            //     setSelectedFile(imagePath)
            // } else {

            //     setPreviewUrl(null)

            // }
        }
    }, [clientData, setValue])


    // const handleFileSelect = (file: File) => {
    //     setSelectedFile(file)
    //     setPreviewUrl(URL.createObjectURL(file))
    //     setShowUploader(false)
    // }

    const updateFunction = (data: FormFields) => {
        // if (selectedFile === null) {
        //     return toast.error("Profile Image is require.")
        // }
        const formData = new FormData()
        formData.append('clientId', clientData?.id || '')
        formData.append('fullName', data.fullName)
        formData.append('email', data.email)
        formData.append('licenseNo', data.licenseNo)
        formData.append('age', data?.age?.toString() ?? '')
        formData.append('gender', data.gender ?? 'Male')
        formData.append('status', data.status ?? 'active')
        formData.append('address', data.address ?? '')
        formData.append('contactNo', data.contactNo)
        formData.append('state', data.state)
        formData.append('country', data.country ?? '')
        formData.append("clientShowToOthers", wantToBeSeen.toString());

        // if (selectedFile !== null) {

        //     formData.append('profileImage', selectedFile)
        // }

        updateMutation.mutate(formData)
    }

    const updateMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            await clientApiService.updateClientApi(formData)
        },
        onMutate: () => setIsLoader(true),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
            toast.success("Account has been updated successfully")
            setIsLoader(false)
        },
        onError: () => {
            toast.error("Failed to update the client!")
            setIsLoader(false)
        }
    })

    return (
        <div className='relative pl-2'>
            {isLoader && <Loader text='Updating...' />}
            {isShowDeleteModal && <DeleteClientModal />}
            <FormProvider {...methods}>

                <form onSubmit={handleSubmit(updateFunction)} className="mt-6">
                    {/* <div className='mb-5'>
                        <LabelData label='Client Image' />
                        <div className="relative w-32 h-32">
                            {!showUploader ? (
                                previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Client"
                                        className="w-32 h-32 rounded-md object-cover " />
                                ) : (

                                    <UserIcon className="text-8xl text-textColor" />
                                )
                            ) : (
                                <FileUploader onFileSelect={handleFileSelect} />
                            )}

                           
                            {!showUploader && (

                                <CrossIcon onClick={() => {
                                    setShowUploader(true);
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }} />
                            )}
                        </div>

                    </div> */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
                        <InputField required label='Full Name' register={register("fullName")} placeHolder='Enter Full Name.' error={errors.fullName?.message} />
                        <InputField required label='license Number' type='number' register={register("licenseNo")} placeHolder='Enter licenseNo.' error={errors.licenseNo?.message} />

                        <InputField label='Age' type='number' register={register("age")} placeHolder='Enter Age.' error={errors.age?.message} />
                        <InputField required label='Email' register={register("email")} placeHolder='Enter Email.' error={errors.email?.message} />
                        <InputField required label='Contact Number' type='number' register={register("contactNo")} placeHolder='Enter contact.' error={errors.contactNo?.message} />
                        <Dropdown<FormFields>
                            name="gender"
                            label="Gender"
                            control={control}
                            options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]}
                            placeholder="Choose an option"
                            error={errors.gender?.message}
                        />
                        {/* 
                        <CountryStateSelect isFlex
                            defaultCountry={clientData?.user?.country}
                            defaultState={clientData?.user?.state}
                        /> */}

                        <CountryStateSelect
                            isCountryView={true}
                            isStateView={false}
                            defaultCountry={clientData?.user?.country}
                             required={false}
                        // defaultState={getMeData?.user?.state}
                        />
                        <CountryStateSelect
                            isCountryView={false}
                            isStateView={true}
                            // defaultCountry={getMeData?.user?.country}
                            defaultState={clientData?.user?.state}
                             required={false}
                        />
                        <InputField label='Address' register={register("address")} placeHolder='Enter Address.' error={errors.address?.message} />

                        <Dropdown<FormFields>
                            name="status"
                            label="Status"
                            control={control}
                            options={statusOption}
                            placeholder="Choose an option"
                            error={errors.status?.message}
                        />

                        <div className=' '>
                            <LabelData label='List of Providers' />
                            <ul className='text-[14px] font-medium text-textGreyColor list-disc '>
                                {clientData?.providerList?.length === 0 || clientData?.providerList === undefined
                                    ? <p>No Providers Found</p>
                                    : clientData?.providerList.map((provider: Provider, index) => (
                                        <li className='flex items-center gap-x-1 capitalize' key={index}>
                                            <GoDotFill size={10} /> {provider?.provider?.user?.fullName}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                        <div className='mt-8'
                        >
                            <Checkbox
                                text="Want to be seen by different providers for this client"
                                checked={wantToBeSeen}
                                onChange={handleCheckboxChange}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className='mt-10 w-[100px]'>
                            <Button text='Update' />
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}

export default EditClientetails
