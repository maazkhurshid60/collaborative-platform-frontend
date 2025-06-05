import OutletLayout from '../../../layouts/outletLayout/OutletLayout';
import LabelData from '../../../components/labelText/LabelData';
import Button from '../../../components/button/Button';
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../../../components/inputField/InputField";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice";
import { accountSchema } from '../../../schema/clientSchema/ClientSchema';
import BackIcon from '../../../components/icons/back/Back';
import UploadFile from '../../../components/inputField/UploadFile';
import { AiOutlineDelete } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import loginUserApiService from '../../../apiServices/loginUserApi/LoginUserApi';
import Loader from '../../../components/loader/Loader';
import { saveLoginUserDetailsReducer } from '../../../redux/slices/LoginUserDetailSlice';
import { GetMeType } from '../../../types/clientType/ClientType';
import DeleteClientModal from '../../../components/modals/providerModal/deleteClientModal/DeleteClientModal';
import { useNavigate } from 'react-router-dom';
import CrossIcon from '../../../components/icons/cross/Cross';

type FormFields = z.infer<typeof accountSchema>;

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M24.9956 7.36083L13.6169 18.7594C12.4838 19.8945 9.1202 20.4202 8.36878 19.6674C7.61735 18.9147 8.13023 15.5453 9.26333 14.4102L20.654 2.9997C20.9349 2.6927 21.2749 2.44592 21.6538 2.27422C22.0325 2.10253 22.442 2.00945 22.8577 2.00068C23.2733 1.99192 23.6864 2.0676 24.072 2.22318C24.4576 2.37876 24.8078 2.61103 25.1014 2.90592C25.3949 3.2008 25.6258 3.55219 25.78 3.93891C25.9343 4.32564 26.0088 4.73964 25.9989 5.15598C25.989 5.57232 25.8949 5.98237 25.7225 6.3613C25.5501 6.74024 25.3028 7.08028 24.9956 7.36083Z" stroke="#2C9993" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M12.7346 4.49414H6.77095C5.50561 4.49414 4.29218 4.99766 3.39745 5.89396C2.50273 6.79025 2 8.00588 2 9.27343V21.2217C2 22.4892 2.50273 23.7048 3.39745 24.6011C4.29218 25.4974 5.50561 26.0009 6.77095 26.0009H19.8911C22.527 26.0009 23.4693 23.8503 23.4693 21.2217V15.2475" stroke="#2C9993" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>);



const Settings = () => {
    const [isEdit, setIsEdit] = useState(false);
    const [signAdd, setSignAdd] = useState<string | null>(null);
    const [isUploadedSignature, setIsUploadedSignature] = useState<boolean>(false);

    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails);
    const [getMeDetail, setGetMeDetail] = useState<GetMeType | undefined>(undefined);
    const [isLoader, setIsLoader] = useState(false);
    const queryClient = useQueryClient();

    const isShowDeleteModal = useSelector((state: RootState) => state.modalSlice.isModalDelete);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<FormFields>({
        resolver: zodResolver(accountSchema),
    });

    // const baseUrl =
    //     import.meta.env.VITE_ENV === "LOCALHOST"
    //         ? "http://localhost:8000"
    //         : "https://collaborative-platform-backend.onrender.com";

    const blobUrlToFile = async (blobUrl: string, filename = "signature.png"): Promise<File> => {
        const res = await fetch(blobUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSignAdd(imageUrl);
            setIsUploadedSignature(true);
        }
    };

    const updateMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await loginUserApiService.updateMeApi(formData);
            dispatch(saveLoginUserDetailsReducer(response?.data));
        },
        onMutate: () => setIsLoader(true),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loginUser'] });
            toast.success("Account updated successfully");
            setIsEdit(false);
            setIsLoader(false);
        },
        onError: () => {
            toast.error("Failed to update account");
            setIsLoader(false);
        },
    });

    const updateFunction = async (data: FormFields) => {
        if (signAdd === null) {
            return toast.error("E-Signature is required")
        }
        const formData = new FormData();
        formData.append("fullName", data.fullName);
        formData.append("cnic", data.cnic);
        formData.append("email", data.email);
        if (data.password) {
            formData.append("password", data.password);
        }

        if (signAdd && isUploadedSignature) {

            // User uploaded a new image
            const file = await blobUrlToFile(signAdd);
            formData.append("eSignature", file);
        } else if (!signAdd && !isUploadedSignature) {
            // User removed the image — send an empty string or a special flag
            formData.append("eSignature", "");
        }

        formData.append("loginUserId", loginUserId?.user?.id);
        if (getMeDetail?.user?.role) {
            formData.append("role", getMeDetail?.user?.role);
        }
        updateMutation.mutate(formData);
    };

    const { data: getMeData, isLoading, isError } = useQuery<GetMeType>({
        queryKey: ["loginUser"],
        queryFn: async () => {
            const response = await loginUserApiService.getMeApi({
                role: loginUserId?.user?.role,
                loginUserId: loginUserId?.id
            });
            return response?.data?.data;
        },
    });

    useEffect(() => {
        if (getMeData) {
            setGetMeDetail(getMeData);
            setValue("fullName", getMeData?.user?.fullName ?? "");
            setValue("cnic", getMeData?.user?.cnic ?? "");
            setValue("email", getMeData?.email ?? "");

            if (getMeData?.eSignature) {
                // const cleanedPath = getMeData.eSignature.replace(/\\/g, '/'); // Convert Windows slashes
                // const updatedPath = cleanedPath.replace('/uploads/', '/uploads/eSignatures/');
                // setSignAdd(`http://localhost:8000${updatedPath}`);
                setSignAdd(getMeData.eSignature);

                setIsUploadedSignature(false);
            } else {
                setSignAdd(null);
                setIsUploadedSignature(false);
            }
        }
    }, [getMeData]);


    const deleteMe = () => deleteMeMutation.mutate();

    const deleteMeMutation = useMutation({
        mutationFn: async () => await loginUserApiService.deleteMeApi(loginUserId?.user?.id),
        onSuccess: () => {
            dispatch(isModalDeleteReducer(false));
            toast.error('Your Account has been deleted.');
            navigate("/");
        },
        onError: () => toast.error('Failed to delete account!'),
    });




    if (isLoading) return <Loader text="Loading..." />;
    if (isError) return <p>Something went wrong</p>;

    return (
        <OutletLayout
            heading="Account Settings"
            button={!isEdit && (
                <Button
                    icon={<AiOutlineDelete size={18} className="text-white" />}
                    text="Delete Account"
                    onclick={() => dispatch(isModalDeleteReducer(true))}
                />
            )}
        >
            {!isEdit && <div className='relative'>
                <div className='absolute -top-8 left-[230px] text-primaryColorDark'>

                    <EditIcon />
                </div>
            </div>}
            {isLoader && <Loader text="Updating..." />}
            {isEdit && (
                <div className="relative">
                    <div className='absolute  -left-2 -top-14 md:-top-23.5 md:-left-2.5 lg:-left-5 lg:-top-14'>
                        <BackIcon onClick={() => setIsEdit(false)} />
                    </div>
                </div>
            )}
            {isShowDeleteModal && (
                <DeleteClientModal
                    onDeleteConfirm={deleteMe}
                    heading='Delete Account'
                    text={
                        <div>
                            By deleting your account, you won’t be able to track your signed documents.
                            Are you sure you want to <span className='font-semibold'>Delete your Account</span>?
                        </div>
                    }
                />
            )}

            <p className="font-bold mt-6">General Settings</p>

            {isEdit ? (
                <form onSubmit={handleSubmit(updateFunction)} className="mt-2 ">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-5">
                        <InputField required label="Full Name" register={register("fullName")} name="fullName" placeHolder="Enter Full Name." error={errors.fullName?.message} />
                        <InputField required label="CNIC Number" register={register("cnic")} name="cnic" placeHolder="Enter CNIC." error={errors.cnic?.message} />
                        <InputField required label="Email ID" register={register("email")} name="email" placeHolder="Enter Email." error={errors.email?.message} />
                        <InputField label="Password" register={register("password")} name="password" placeHolder="Enter Password." error={errors.password?.message} />
                    </div>

                    <hr className="w-full h-[1px] text-greyColor mt-10" />

                    <div className="w-[300px] mt-10">
                        <div className='flex items-start gap-x-2.5'>

                            <p className="font-semibold mb-2">E-Signature</p>
                            <p className='text-redColor'>*</p>
                        </div>
                        {signAdd ? (
                            <div className="relative">
                                <img
                                    src={signAdd}
                                    alt="Uploaded Signature"
                                    style={{ maxHeight: "120px", objectFit: "contain" }}
                                />

                                <CrossIcon onClick={() => setSignAdd(null)} />
                            </div>
                        ) : (
                            <UploadFile onChange={handleFileChange} text="Add your signature here" heading="Sign here" />
                        )}
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="mt-10 w-[100px]">
                            <Button text="Update" />
                        </div>
                    </div>
                </form>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-5">
                        <LabelData label="Full Name" data={getMeData?.user?.fullName} />
                        <LabelData label="CNIC Number" data={getMeData?.user?.cnic} />
                        <LabelData label="Email ID" data={getMeData?.email} />
                    </div>

                    <hr className="w-full h-[1px] text-greyColor mt-10" />

                    <div className="w-[300px] mt-10">
                        <p className="font-semibold mb-2">E-Signature</p>
                        {signAdd ? (
                            <img
                                src={signAdd}
                                alt="E-Signature"
                                style={{ maxHeight: "120px", objectFit: "contain", marginTop: "20px" }}
                            />
                        ) : (
                            <p>No image selected</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end w-full mt-8">
                        <div className="w-[100px]">
                            <Button text="Edit" sm onclick={() => setIsEdit(true)} />
                        </div>
                    </div>
                </>
            )}
        </OutletLayout>
    );
};

export default Settings;
