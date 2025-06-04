import Button from '../../../button/Button'
import InputField from '../../../inputField/InputField'
import Dropdown from '../../../dropdown/Dropdown'
import LabelData from '../../../labelText/LabelData'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clientSchema } from '../../../../schema/clientSchema/ClientSchema'
import { statusOption } from '../../../../constantData/statusOptions'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../redux/store'
import DeleteClientModal from '../../../modals/providerModal/deleteClientModal/DeleteClientModal'
import UserIcon from '../../../icons/user/User'
import { ClientType, Provider } from '../../../../types/clientType/ClientType'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import clientApiService from '../../../../apiServices/clientApi/ClientApi'
import { toast } from 'react-toastify'
import Loader from '../../../loader/Loader'
import { GoDotFill } from 'react-icons/go'
import FileUploader from '../../../uploader/fileUploader/FileUploader'
import CrossIcon from '../../../icons/cross/Cross'

// Adjust the import path if needed

type FormFields = z.infer<typeof clientSchema>

interface EditClientDetailProps {
    clientData?: ClientType
}

const EditClientetails: React.FC<EditClientDetailProps> = ({ clientData }) => {
    const isShowDeleteModal = useSelector((state: RootState) => state.modalSlice.isModalDelete)
    const { register, control, formState: { errors }, handleSubmit, setValue } = useForm<FormFields>({
        resolver: zodResolver(clientSchema)
    })
    const queryClient = useQueryClient()
    const [isLoader, setIsLoader] = useState(false)
    const [showUploader, setShowUploader] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (clientData) {
            setValue("cnic", clientData?.user?.cnic ?? "")
            setValue("email", clientData?.email ?? "")
            setValue("fullName", clientData?.user?.fullName ?? "")
            setValue("status", clientData?.user?.status ?? "")
            setValue("address", clientData?.user?.address ?? "")
            setValue("contactNo", clientData?.user?.contactNo ?? "")
            setValue("age", clientData?.user?.age?.toString() ?? "")
            setValue("gender", clientData?.user?.gender ?? "")
            console.log("Client profileimage", clientData?.user?.profileImage);

            if (clientData?.user?.profileImage !== "null" && clientData?.user?.profileImage !== null) {
                console.log("clientData?.user?.profileImage", clientData?.user?.profileImage);
                // const imagePath = `${localhostBaseUrl}uploads/eSignatures/${clientData?.user?.profileImage?.split('/').pop()}`
                // setPreviewUrl(imagePath)
                // const imagePath = clientData?.user?.profileImage ? generateImgUrl(clientData?.user?.profileImage) : null;
                const imagePath = clientData?.user?.profileImage ? clientData?.user?.profileImage : null;
                setPreviewUrl(imagePath)
                setSelectedFile(null)
            } else {
                toast.error(".")

                setPreviewUrl(null)

            }
        }
    }, [clientData, setValue])
    // console.log("previewUrlpreviewUrlpreviewUrl", previewUrl);


    const handleFileSelect = (file: File) => {
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setShowUploader(false)
    }

    const updateFunction = (data: FormFields) => {
        const formData = new FormData()
        formData.append('clientId', clientData?.id || '')
        formData.append('fullName', data.fullName)
        formData.append('email', data.email)
        formData.append('cnic', data.cnic)
        formData.append('age', data.age.toString())
        formData.append('gender', data.gender)
        formData.append('status', data.status)
        formData.append('address', data.address)
        formData.append('contactNo', data.contactNo)
        if (selectedFile !== null) {
            console.log("<<<<<<<<<<<<<<<<<<<<<<<<");

            formData.append('profileImage', selectedFile)
        }

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

            <form onSubmit={handleSubmit(updateFunction)} className="mt-6">
                <div className='mb-5'>
                    <LabelData label='Client Image' />
                    <div className="relative w-32 h-32">
                        {!showUploader ? (
                            previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Client"
                                    className="w-32 h-32 rounded-full object-cover"
                                />
                            ) : (

                                <UserIcon className="text-8xl text-textColor" />
                            )
                        ) : (
                            <FileUploader onFileSelect={handleFileSelect} />
                        )}

                        {/* Show cross icon even if there's no image */}
                        {!showUploader && (

                            <CrossIcon onClick={() => {
                                setShowUploader(true);
                                setSelectedFile(null);
                                setPreviewUrl(null);
                            }} />
                        )}
                    </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
                    <InputField required label='Full Name' register={register("fullName")} name='fullName' placeHolder='Enter Full Name.' error={errors.fullName?.message} />
                    <InputField required label='CNIC No' register={register("cnic")} name='cnic' placeHolder='Enter CNIC.' error={errors.cnic?.message} />
                    <InputField required label='Age' register={register("age")} name='age' placeHolder='Enter Age.' error={errors.age?.message} />
                    <InputField required label='Email' register={register("email")} name='email' placeHolder='Enter Email.' error={errors.email?.message} />
                    <InputField required label='Contact' register={register("contactNo")} name='contactNo' placeHolder='Enter contact.' error={errors.contactNo?.message} />
                    <InputField required label='Address' register={register("address")} name='address' placeHolder='Enter Address.' error={errors.address?.message} />

                    <Dropdown<FormFields>
                        name="gender"
                        label="Gender"
                        control={control}
                        options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]}
                        placeholder="Choose an option"
                        error={errors.gender?.message}
                        required
                    />

                    <Dropdown<FormFields>
                        name="status"
                        label="Status"
                        control={control}
                        options={statusOption}
                        placeholder="Choose an option"
                        error={errors.status?.message}
                        required
                    />

                    <div className=' '>
                        <LabelData label='List of Providers' />
                        <ul className='text-[14px] font-medium text-textGreyColor list-disc ml-6'>
                            {clientData?.providerList?.length === 0 || clientData?.providerList === undefined
                                ? <p>No Providers Found</p>
                                : clientData?.providerList.map((provider: Provider, index) => (
                                    <li className='flex items-center gap-x-1 capitalize' key={index}>
                                        <GoDotFill size={10} /> {provider?.provider?.user?.fullName}
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <div className='mt-10 w-[100px]'>
                        <Button text='Update' />
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditClientetails
