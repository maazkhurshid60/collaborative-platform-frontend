import { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { HiOutlineEyeOff, HiOutlineEye } from "react-icons/hi";

interface InputFieldProps {
    placeHolder?: string;
    type?: string;
    label?: string;
    readOnly?: boolean;
    register?: UseFormRegisterReturn;
    error?: string;
    required?: boolean;
    variant?: "default" | "signup"
}

const InputField: React.FC<InputFieldProps> = ({
    placeHolder,
    type,
    label,
    readOnly,
    register,
    error,
    required = false,
    variant = "default",
}) => {
    const [isHidden, setIsHidden] = useState(true);

    return (
        <div>
            {label && (
                <div className="flex items-center gap-x-1">
                    <p className="labelMedium mb-1">{label}</p>
                    {required && variant !== "signup" && <p className="text-redColor">*</p>}
                </div>
            )}
            <div className="relative">
                <input
                    {...register}
                    className="bg-inputBgColor w-[100%] p-2 outline-0 rounded-md placeholder:text-[12px] appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
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
                {type === "password" &&
                    (isHidden ? (
                        <HiOutlineEyeOff
                            className="absolute top-3.5 right-2 w-[17px] h-[12px] sm:w-[20px] sm:h-[15px] cursor-pointer"
                            onClick={() => setIsHidden(false)}
                        />
                    ) : (
                        <HiOutlineEye
                            onClick={() => setIsHidden(true)}
                            className="absolute top-3.5 right-2 w-[17px] h-[12px] sm:w-[20px] sm:h-[15px] cursor-pointer"
                        />
                    ))}
            </div>
            {error && <p className="errorText text-left mt-1">{error}</p>}
        </div>
    );
};

export default InputField;


// import { useState } from "react";
// import { UseFormRegisterReturn } from "react-hook-form";
// import { HiOutlineEyeOff, HiOutlineEye } from "react-icons/hi";


// interface InputFieldProps {
//     name?: string;
//     onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     placeHolder?: string;
//     type?: string;
//     label?: string;
//     readOnly?: boolean;
//     value?: string;
//     register?: UseFormRegisterReturn;
//     error?: string;
//     required?: boolean
// }

// const InputField: React.FC<InputFieldProps> = ({ name,
//     onChange,
//     placeHolder,
//     type,
//     label,
//     readOnly,
//     value,
//     register,
//     error,
//     required = false }) => {
//     const [isHidden, setIsHidden] = useState(true);

//     return (
//         <div className="" >
//             {label && <div className="flex items-center gap-x-1"><p className="labelMedium mb-1">{label} </p>{required && <p className="text-redColor">*</p>}</div>}
//             <div className="relative">
//                 <input
//                     {...register}
//                     name={name}
//                     value={value}
//                     onChange={onChange}
//                     className="bg-inputBgColor w-[100%] p-2 outline-0 rounded-md placeholder:text-[12px]"
//                     type={
//                         type === "password"
//                             ? isHidden
//                                 ? "password"
//                                 : "text"
//                             : type
//                     }
//                     placeholder={placeHolder}
//                     readOnly={readOnly}
//                 />
//                 {type === "password" && (
//                     isHidden ? <HiOutlineEyeOff className=" absolute top-3.5 right-2 w-[17px] h-[12px] sm:w-[20px] sm:h-[15px] cursor-pointer"
//                         onClick={() => setIsHidden(false)} /> : <HiOutlineEye onClick={() => setIsHidden(true)}
//                             className="absolute top-3.5 right-2 w-[17px] h-[12px] sm:w-[20px] sm:h-[15px] cursor-pointer" />
//                 )}
//             </div>
//             {error && <p className="errorText text-left mt-1">{error}</p>} {/* Display error */}
//         </div>
//     );
// };

// export default InputField;
