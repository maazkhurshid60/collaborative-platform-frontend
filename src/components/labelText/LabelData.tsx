
interface LabelDataProps {
    label?: string
    data?: string
}
const LabelData: React.FC<LabelDataProps> = (props) => {
    return (
        <div>
            <p className='labelMedium font-medium text-textColor'>{props.label}</p>
            <p className='text-[14px]  py-2  font-medium text-textGreyColor'>{props.data}</p>
        </div>
    )
}

export default LabelData