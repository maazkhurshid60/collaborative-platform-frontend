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
import { FaRegEdit } from "react-icons/fa";
import CrossIcon from '../../../components/icons/cross/Cross';

type FormFields = z.infer<typeof accountSchema>;

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

        formData.append("loginUserId", loginUserId?.user.id);
        if (getMeDetail?.user?.role) {
            formData.append("role", getMeDetail.user.role);
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
                const cleanedPath = getMeData.eSignature.replace(/\\/g, '/'); // Convert Windows slashes
                const updatedPath = cleanedPath.replace('/uploads/', '/uploads/eSignatures/');
                setSignAdd(`http://localhost:8000${updatedPath}`);
                console.log("http://localhost:8000http://localhost:8000http://localhost:8000", `http://localhost:8000${cleanedPath}`);
                setIsUploadedSignature(false);
            } else {
                setSignAdd(null);
                setIsUploadedSignature(false);
            }
        }
    }, [getMeData]);


    const deleteMe = () => deleteMeMutation.mutate();

    const deleteMeMutation = useMutation({
        mutationFn: async () => await loginUserApiService.deleteMeApi(loginUserId.user.id),
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
                <FaRegEdit className='absolute -top-8 left-[230px] text-primaryColorDark' size={20} />
            </div>}
            {isLoader && <Loader text="Updating..." />}
            {isEdit && (
                <div className="relative">
                    <div className="absolute -left-6 -top-12 md:-top-14 lg:-left-5">
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
                <form onSubmit={handleSubmit(updateFunction)} className="mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-5">
                        <InputField required label="Full Name" register={register("fullName")} name="fullName" placeHolder="Enter Full Name." error={errors.fullName?.message} />
                        <InputField required label="CNIC Number" register={register("cnic")} name="cnic" placeHolder="Enter CNIC." error={errors.cnic?.message} />
                        <InputField required label="Email ID" register={register("email")} name="email" placeHolder="Enter Email." error={errors.email?.message} />
                        <InputField label="Password" register={register("password")} name="password" placeHolder="Enter Password." error={errors.password?.message} />
                    </div>

                    <hr className="w-full h-[1px] text-greyColor mt-10" />

                    <div className="w-[300px] mt-10">
                        <p className="font-semibold mb-2">E-Signature</p>
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
