import OutletLayout from '../../../layouts/outletLayout/OutletLayout';
import LabelData from '../../../components/labelText/LabelData';
import Button from '../../../components/button/Button';
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../../../components/inputField/InputField";
import Dropdown from "../../../components/dropdown/Dropdown";
import { toast } from "react-toastify";
import DeleteClientModal from "../../../components/modals/providerModal/deleteClientModal/DeleteClientModal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { providerSchema } from "../../../schema/providerSchema/ProviderSchema";
import UserIcon from '../../../components/icons/user/User';
import BackIcon from '../../../components/icons/back/Back';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProviderType } from '../../../types/providerType/ProviderType';
import Loader from '../../../components/loader/Loader';
import loginUserApiService from '../../../apiServices/loginUserApi/LoginUserApi';
import { saveLoginUserDetailsReducer } from '../../../redux/slices/LoginUserDetailSlice';
import { GoDotFill } from 'react-icons/go';
import FileUploader from '../../../components/uploader/fileUploader/FileUploader';
import CrossIcon from '../../../components/icons/cross/Cross';
import generateImgUrl from '../../../utils/GenerateImgUrl';
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
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    const [getMeDetail, setGetMeDetail] = useState<ProviderType | undefined>(undefined);
    const [isLoader, setIsLoader] = useState(false)
    const [showUploader, setShowUploader] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const queryClient = useQueryClient()
    const dispatch = useDispatch<AppDispatch>()
    const {
        register,
        handleSubmit,
        formState: { errors }, control, setValue
    } = useForm<FormFields>({
        resolver: zodResolver(providerSchema),
    });

    const updateFunction = (data: FormFields) => {
        const formData = new FormData()
        formData.append('address', data?.address)
        formData.append('fullName', data?.fullName)
        formData.append('email', data?.email)
        formData.append('cnic', data?.cnic)
        formData.append('age', data?.age?.toString())
        formData.append('department', data?.department)
        formData.append('loginUserId', loginUserDetail?.user?.id)
        formData.append('role', loginUserDetail?.user?.role)
        formData.append('contactNo', data?.contactNo)
        // // toast.success("User has updated successfully")
        if (selectedFile !== null) {
            formData.append('profileImage', selectedFile)
        }
        else {
            formData.append('profileImage', "")
        }
        updateMutation.mutate(formData)

    }


    const { data: getMeData, isLoading, isError } = useQuery<ProviderType>({
        queryKey: ["loginUser"],
        queryFn: async () => {
            const dataSendToBackend = { role: loginUserDetail?.user?.role, loginUserId: loginUserDetail.id }
            const response = await loginUserApiService.getMeApi(dataSendToBackend);
            return response?.data?.data; // Should be a single object, not array
        }
    })


    useEffect(() => {
        if (getMeData) {
            setGetMeDetail(getMeData);

            setValue("fullName", getMeData?.user?.fullName ?? "")
            setValue("cnic", getMeData?.user?.cnic ?? "")
            setValue("age", getMeData?.user?.age?.toString() ?? "")
            setValue("contactNo", getMeData?.user?.contactNo ?? "")
            setValue("email", getMeData?.email ?? "")
            setValue("department", getMeData?.department ?? "")
            setValue("address", getMeData?.user?.address ?? "")
            console.log("getMeData?.user?.profileImage", getMeData?.user?.profileImage);

            if (getMeData?.user?.profileImage && getMeData?.user?.profileImage !== "null") {
                // const imagePath = `${localhostBaseUrl}uploads/eSignatures/${getMeData.user.profileImage?.split('/').pop()}`
                // setPreviewUrl(imagePath)
                const url = generateImgUrl(getMeData.user.profileImage);
                setPreviewUrl(url)
                setSelectedFile(null)
            } else {
                setPreviewUrl(null)
            }
        }
    }, [getMeData])

    const handleFileSelect = (file: File) => {
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setShowUploader(false)
    }

    console.log("previewUrlpreviewUrlpreviewUrlpreviewUrl", previewUrl);

    const updateMutation = useMutation({

        mutationFn: async (data: FormData) => {
            const response = await loginUserApiService.updateMeApi(data)
            console.log("reponse", response);

            dispatch(saveLoginUserDetailsReducer(response?.data))
        },

        onMutate: () => {
            setIsLoader(true);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loginUser'] });
            toast.success("Account has updated successfully")
            setIsEdit(false)

            setIsLoader(false)
        },
        onError: () => {
            toast.error('Failed to update the your account!');
            setIsLoader(false)
        },

    });
    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>somethingwent wrong</p>
    }
    return (
        <OutletLayout heading='User profile'>
            {isLoader && <Loader text='Updating...' />}

            {isEdit && <div className='relative'>
                <div className='absolute  -left-2 -top-14 md:-top-23.5 md:-left-2.5 lg:-left-5 lg:-top-14'>
                    <BackIcon onClick={() => setIsEdit(false)} />
                </div>
            </div>}
            {isShowDeleteModal && <DeleteClientModal />}

            {isEdit ?
                <form onSubmit={handleSubmit(updateFunction)} className="mt-6">
                    <div>
                        <LabelData label='User Image' />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 md:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-[33px] mt-5 md:mt-10">
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
                            <Dropdown<FormFields>
                                name="department"
                                label="Profession"
                                control={control}
                                options={departmentOptions}
                                placeholder="Choose an option"
                                error={errors.department?.message}
                                required
                            />                </div>
                        <div className=''>
                            <InputField required label='Email' register={register("email")} name='email' placeHolder='Enter Email.' error={errors.email?.message} />
                        </div>

                        <div className=''>
                            <InputField required label='Contact No' register={register("contactNo")} name='contactNo' placeHolder='Enter contact.' error={errors.contactNo?.message} />
                        </div>




                        <div className=' '>
                            <LabelData label='List of Active Clients' />

                            <ul className="text-[14px] font-medium text-textGreyColor">
                                {getMeDetail?.clientList?.map((data, index) => (
                                    <li key={index}>
                                        <div className="flex items-center gap-x-3">
                                            <div className="flex items-center gap-x-2 w-[150px]">

                                                <GoDotFill className='text-[6px]' />
                                                {data?.client?.user?.fullName}
                                            </div>


                                        </div>
                                    </li>
                                ))}
                            </ul>


                        </div>
                        <div className=''>
                            <InputField required label='Address' register={register("address")} name='address' placeHolder='Enter Address.' error={errors.address?.message} />
                        </div>
                    </div>
                    <div className="flex items-center justify-end">

                        <div className='mt-10  w-[100px]'>

                            <Button text='Update' sm />
                        </div>
                    </div>
                </form>
                :
                <>
                    <div className='mt-6'>
                        <div>
                            <LabelData label='User Image' />
                            {/* <UserIcon className='text-6xl mt-2' /> */}

                            <div className="relative w-32 h-32">
                                {
                                    previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Client"
                                            className="w-32 h-32 rounded-full object-cover"
                                        />
                                    ) : (

                                        <UserIcon className="text-8xl text-textColor" />
                                    )
                                }


                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 md:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
                            <div className=''>
                                <LabelData label='Full Name' data={getMeData?.user?.fullName} />
                            </div>
                            <div className=''>
                                <LabelData label='CNIC Number' data={getMeData?.user?.cnic} />
                            </div>
                            <div className=''>
                                <LabelData label='Age' data={getMeData?.user?.age ?? ""} />
                            </div>
                            <div className=''>
                                <LabelData label='Profession' data={getMeData?.department} />
                            </div>
                            <div className=''>
                                <LabelData label='Email' data={getMeData?.email} />
                            </div>
                            <div className=''>
                                <LabelData label='Contact No' data={getMeData?.user?.contactNo ?? ""} />
                            </div>


                            <div className=' '>
                                <LabelData label='List of Active Clients' />
                                <ul className="text-[14px] font-medium text-textGreyColor ">
                                    {getMeDetail?.clientList && getMeDetail?.clientList?.length > 0 ?
                                        getMeDetail?.clientList?.map((data, index) => (
                                            <li key={index}>
                                                <div className="flex items-center gap-x-3">
                                                    <div className="flex items-center gap-x-2 w-[150px]">

                                                        <GoDotFill className='text-[6px]' />
                                                        {data?.client?.user?.fullName}
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                        :
                                        <p>No Clients Found</p>}
                                </ul>
                            </div>
                            <div className=''>
                                <LabelData label='Address' data={getMeData?.user?.address ?? ""} />
                            </div>
                        </div>

                    </div>
                    <div className='flex items-center justify-end w-full'>
                        <div className='w-[100px] mt-10'>
                            <Button text='Edit' sm onclick={() => setIsEdit(true)} />
                        </div>
                    </div>
                </>
            }


        </OutletLayout>
    )
}

export default UserProfile