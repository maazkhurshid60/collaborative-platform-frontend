
interface LabelDataProps {
    label?: string
    data?: string
    required?: boolean
}
const LabelData: React.FC<LabelDataProps> = ({ label, data, required = false }) => {
    return (
        <div>
            <p className='labelMedium font-medium text-textColor'>{label} {required && <span className="text-redColor">*</span>}</p>
            <p className={`text-[14px]  py-2  font-medium text-textGreyColor ${label === "Email ID" ? "lowercase" : "capitalize"}`}>{data}</p>
        </div>
    )
}

export default LabelData