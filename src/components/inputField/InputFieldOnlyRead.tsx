

interface InputFieldProps {
    placeHolder?: string;
    label?: string;

    value: string | undefined
    required?: boolean;
}

const InputFieldOnlyRead: React.FC<InputFieldProps> = ({
    placeHolder,
    label,
    value,
    required = false,
}) => {

    return (
        <div>
            {label && (
                <div className="flex items-center gap-x-1">
                    <p className="labelMedium mb-1">{label}</p>
                    {required && <p className="text-redColor">*</p>}
                </div>
            )}
            <div className="relative">
                <input

                    className="bg-inputBgColor w-[100%] p-2 outline-0 rounded-md placeholder:text-[12px]"
                    value={value}
                    placeholder={placeHolder}
                    readOnly={true}
                />

            </div>
        </div>
    );
};

export default InputFieldOnlyRead;