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
import { RxCross2 } from 'react-icons/rx';
import { AiOutlineDelete } from 'react-icons/ai';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import loginUserApiService from '../../../apiServices/loginUserApi/LoginUserApi';
import Loader from '../../../components/loader/Loader';
import { saveLoginUserDetailsReducer } from '../../../redux/slices/LoginUserDetailSlice';
import { GetMeType } from '../../../types/clientType/ClientType';
import { baseUrl } from '../../../apiServices/baseUrl/BaseUrl';
import { useNavigate } from 'react-router-dom';
import DeleteClientModal from '../../../components/modals/providerModal/deleteClientModal/DeleteClientModal';

type FormFields = z.infer<typeof accountSchema>;

const Settings = () => {
    const [isEdit, setIsEdit] = useState(false);
    const [signAdd, setSignAdd] = useState<string | null>("");
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
            toast.success("Account has updated successfully");
            setIsEdit(false);
            setIsLoader(false);
        },
        onError: () => {
            toast.error("Failed to update your account!");
            setIsLoader(false);
        },
    });

    const updateFunction = async (data: FormFields) => {
        const formData = new FormData();
        formData.append("fullName", data.fullName);
        formData.append("cnic", data.cnic);
        formData.append("email", data.email);
        if (data.password) formData.append("password", data.password);
        if (signAdd !== null) {
            const file = await blobUrlToFile(signAdd);
            formData.append("eSignature", file);
        }
        else {
            formData.append("eSignature", "null");
        }
        formData.append("loginUserId", loginUserId?.user.id);
        if (getMeDetail?.user?.role) {
            formData.append("role", getMeDetail.user.role);
        } updateMutation.mutate(formData);
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
            setGetMeDetail(getMeData as GetMeType);
            setValue("fullName", getMeData?.user?.fullName ?? "");
            setValue("cnic", getMeData?.user?.cnic ?? "");
            setValue("email", getMeData?.email ?? "");
            // if (getMeData?.eSignature) {
            //     const cleanedPath = getMeData.eSignature.replace(/\\/g, '/');
            //     const finalUrl = `${baseUrl}/uploads/${cleanedPath}`;
            //     setSignAdd(finalUrl);
            // }
            if (getMeData?.eSignature) {
                const cleanedPath = getMeData.eSignature.replace(/\\/g, '/');
                setSignAdd(`${baseUrl}/uploads/${cleanedPath}`);
            } else {
                setSignAdd("");
            }
        }
    }, [getMeData]);
    const filename = signAdd?.split(/[/\\]/).pop(); // handles both / and \
    // const url = `http://localhost:8000/uploads/esignatures/${filename}`;
    const url = `https://collaborative-platform-backend.onrender.com/uploads/esignatures/${filename}`;
    console.log("urlurlurlurlurlurlurlurlurlurlurl", url);
    console.log("getMeDetail", getMeDetail);
    const deleteMe = () => {
        deleteMeMutation.mutate()
    }

    const deleteMeMutation = useMutation({
        mutationFn: async () => {
            return await loginUserApiService.deleteMeApi(loginUserId.user.id);
        },
        onMutate: () => {

        },
        onSuccess: () => {
            dispatch(isModalDeleteReducer(false))
            toast.error('Your Account has deleted successfully.');

            navigate("/")
        },
        onError: () => {
            toast.error('Failed to delete your account!');

        },

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
            {isLoader && <Loader text="Updating..." />}
            {isEdit && (
                <div className="relative">
                    <div className="absolute -left-6 -top-12 md:-top-14 lg:-left-5">
                        <BackIcon onClick={() => setIsEdit(false)} />
                    </div>
                </div>
            )}
            {isShowDeleteModal && <DeleteClientModal onDeleteConfirm={deleteMe}

                text={<div>By Deleting this you account you won’t be able to track record of your signed Documents. Are you sure that you want to <span className='font-semibold'>Delete your Account</span>?</div>}
            />}

            <p className="font-bold mt-6">General Settings</p>

            {isEdit ? (
                <form onSubmit={handleSubmit(updateFunction)} className="mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-5 sm:gap-y-6 md:gap-y-4 mt-5 md:mt-4">
                        <InputField
                            required
                            label="Full Name"
                            register={register("fullName")}
                            name="fullName"
                            placeHolder="Enter Full Name."
                            error={errors.fullName?.message}
                        />
                        <InputField
                            required
                            label="CNIC Number"
                            register={register("cnic")}
                            name="cnic"
                            placeHolder="Enter CNIC."
                            error={errors.cnic?.message}
                        />
                        <InputField
                            required
                            label="Email ID"
                            register={register("email")}
                            name="email"
                            placeHolder="Enter Email."
                            error={errors.email?.message}
                        />
                        <InputField
                            label="Password"
                            register={register("password")}
                            name="password"
                            placeHolder="Enter Password."
                            error={errors.password?.message}
                        />
                    </div>

                    <hr className="w-full h-[1px] text-greyColor mt-10" />

                    <div className="w-[300px] mt-10">
                        <p className="font-semibold mb-2">E-Signature</p>

                        {signAdd ? (
                            <div className="relative">
                                <img
                                    src={url || signAdd}
                                    alt="Uploaded Signature"
                                    style={{ maxHeight: "120px", objectFit: "contain" }}
                                />
                                <RxCross2
                                    className="absolute top-0 right-0 cursor-pointer"
                                    onClick={() => setSignAdd("")}
                                />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-5 sm:gap-y-6 md:gap-y-4 mt-5 md:mt-4">
                        <LabelData label="Full Name" data={getMeData?.user?.fullName} />
                        <LabelData label="CNIC Number" data={getMeData?.user?.cnic} />
                        <LabelData label="Email ID" data={getMeData?.email} />
                    </div>
                    <hr className="w-full h-[1px] text-greyColor mt-10" />

                    <div className="w-[300px] mt-10">
                        <p className="font-semibold mb-2">E-Signature</p>
                        {/* {url !== "http://localhost:8000/uploads/esignatures/" ? <div style={{ marginTop: "20px" }}> */}
                        {url !== "https://collaborative-platform-backend.onrender.com/uploads/esignatures/" ? <div style={{ marginTop: "20px" }}>
                            <img
                                src={`${url}`}

                                style={{ maxHeight: "120px", objectFit: "contain" }}
                            />
                        </div> : <p>No image selected</p>}
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
