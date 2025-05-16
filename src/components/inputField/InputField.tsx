import { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

interface InputFieldProps {
    name?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeHolder?: string;
    type?: string;
    label?: string;
    readOnly?: boolean;
    value?: string;
    register?: UseFormRegisterReturn;
    error?: string;
    required?: boolean
}

const InputField: React.FC<InputFieldProps> = ({ name,
    onChange,
    placeHolder,
    type,
    label,
    readOnly,
    value,
    register,
    error,
    required = false }) => {
    const [isHidden, setIsHidden] = useState(true);

    return (
        <div className="" >
            {label && <div className="flex items-center gap-x-1"><p className="labelMedium mb-1">{label} </p>{required && <p className="text-redColor">*</p>}</div>}
            <div className="relative">
                <input
                    {...register}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="bg-inputBgColor w-[100%] p-2 outline-0 rounded-md"
                    type={
                        type === "password"
                            ? isHidden
                                ? "password"
                                : "text"
                            : type
                    }
                    placeholder={placeHolder}
                    readOnly={readOnly}
                />
                {type === "password" && (
                    isHidden ? <FaRegEyeSlash className=" absolute top-3.5 right-2 w-[17px] h-[12px] sm:w-[20px] sm:h-[15px] cursor-pointer"
                        onClick={() => setIsHidden(false)} /> : <FaRegEye onClick={() => setIsHidden(true)}
                            className="absolute top-3.5 right-2 w-[17px] h-[12px] sm:w-[20px] sm:h-[15px] cursor-pointer" />
                )}
            </div>
            {error && <p className="errorText text-left mt-1">{error}</p>} {/* Display error */}
        </div>
    );
};

export default InputField;
