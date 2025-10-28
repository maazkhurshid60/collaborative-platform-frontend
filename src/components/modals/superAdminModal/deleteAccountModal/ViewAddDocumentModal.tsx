import { IoDocumentText } from "react-icons/io5";
import { FaFilePdf } from "react-icons/fa6";
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { isAddDocumentModalReducer } from '../../../../redux/slices/ModalSlice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import LabelData from '../../../labelText/LabelData';
import Button from '../../../button/Button';
import FileUploader from '../../../uploader/fileUploader/FileUploader';
import CrossIcon from '../../../icons/cross/Cross';
import { documentSignByClientType } from '../../../../types/documentType/DocumentType';
import documentApiService from '../../../../apiServices/documentApi/DocumentApi';
import ModalLayout from "../../modalLayout/ModalLayout";
import InputField from "../../../inputField/InputField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

interface ViewAddDocumentModalProps {
    sharedDocs?: string
    data: documentSignByClientType
    isOnlyRead: boolean
}

export const documentSchema = z.object({
    type: z.string().min(1, "Type is required")
})


type FormFields = z.infer<typeof documentSchema>


const ModalBodyContent: React.FC<{ docs: string, data: documentSignByClientType, isOnlyRead: boolean }> = () => {
    const dispatch = useDispatch<AppDispatch>();
    const queryClient = useQueryClient();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [FileIconComponent, setFileIconComponent] = useState<React.ElementType | null>(null);
    const { register, formState: { errors }, handleSubmit } = useForm<FormFields>({ resolver: zodResolver(documentSchema) })

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            return documentApiService.addDocumentApi(formData);
        },
        onSuccess: () => {
            toast.success("Document uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            dispatch(isAddDocumentModalReducer(false));
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<{ error: string }>;
            const errorMessage = axiosError.response?.data?.error || "Something went wrong";
            toast.error(errorMessage);
        }
    });

    const handleFileSelect = (file: File) => {
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only PDF or Word documents are allowed.");
            return;
        }
        setSelectedFile(file);
        const isPDF = file.type === 'application/pdf';
        const isDOC = file.type.includes('word');

        if (isPDF) setFileIconComponent(() => FaFilePdf);
        if (isDOC) setFileIconComponent(() => IoDocumentText);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileIconComponent(null);
    };

    const submitFunction = async (data: FormFields) => {
        if (!selectedFile) {
            toast.error("Please upload your document.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("type", data.type);

        mutation.mutate(formData);
    };

    return (
        <form className='mt-4 flex flex-col gap-y-4' onSubmit={handleSubmit(submitFunction)}>
            <div className=''>
                <InputField required label='Document Type' register={register("type")} placeHolder='Enter Document Type.' error={errors.type?.message} />
            </div>
            <div className=' overflow-auto'>
                <LabelData label='Upload Document' />

                {selectedFile ? (
                    <div className="flex items-center gap-4 mt-4 bg-gray-100 p-3 rounded-lg relative">
                        {FileIconComponent && <FileIconComponent className="w-10 h-10 text-red-500" />}
                        <span className="truncate w-[200px]">{selectedFile.name}</span>
                        <div className="absolute right-0 top-0">
                            <CrossIcon onClick={removeFile} />
                        </div>
                    </div>
                ) : (
                    <FileUploader onFileSelect={handleFileSelect} />
                )}
            </div>

            <Button text='Add' sm />
        </form>
    );
};


const ViewAddDocumentModal: React.FC<ViewAddDocumentModalProps> = ({ sharedDocs, data, isOnlyRead = false }) => {
    return (
        <ModalLayout
            heading='Add New Document'
            modalBodyContent={<ModalBodyContent docs={sharedDocs ?? ""} data={data} isOnlyRead={isOnlyRead} />}
        />
    );
};

export default ViewAddDocumentModal;
