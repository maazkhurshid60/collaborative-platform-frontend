import ToolTip from "../../toolTip/ToolTip";

interface DeleteIconProps extends React.SVGProps<SVGSVGElement> {
    disabled?: boolean;
}

const DeleteIcon = ({ disabled = false, ...props }: DeleteIconProps) => (
    <div
        className={`relative group ${disabled ? "cursor-not-allowed opacity-50 pointer-events-none" : "cursor-pointer"}`}
    >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M4 7H20M19 7L18.133 19.142C18.0971 19.6466 17.8713 20.1188 17.5011 20.4636C17.1309 20.8083 16.6439 21 16.138 21H7.862C7.35614 21 6.86907 20.8083 6.49889 20.4636C6.1287 20.1188 5.90292 19.6466 5.867 19.142L5 7H19ZM15 7V4C15 3.73478 14.8946 3.48043 14.7071 3.29289C14.5196 3.10536 14.2652 3 14 3H10C9.73478 3 9.48043 3.10536 9.29289 3.29289C9.10536 3.48043 9 3.73478 9 4V7H15Z" stroke="#808B97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>


        {!disabled && <ToolTip toolTipText="Delete" />}
    </div>
);

export default DeleteIcon;


export const EditIcon = ({ disabled = false, ...props }: DeleteIconProps) => (
    <div
        className={`relative group ${disabled ? "cursor-not-allowed opacity-50 pointer-events-none" : "cursor-pointer"}`}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 20H21" stroke="#808B97" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16.5 3.50023C16.8978 3.1024 17.4374 2.87891 18 2.87891C18.2786 2.87891 18.5544 2.93378 18.8118 3.04038C19.0692 3.14699 19.303 3.30324 19.5 3.50023C19.697 3.69721 19.8532 3.93106 19.9598 4.18843C20.0665 4.4458 20.1213 4.72165 20.1213 5.00023C20.1213 5.2788 20.0665 5.55465 19.9598 5.81202C19.8532 6.06939 19.697 6.30324 19.5 6.50023L7 19.0002L3 20.0002L4 16.0002L16.5 3.50023Z" stroke="#808B97" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>


        {!disabled && <ToolTip toolTipText="Delete" />}
    </div>
);


