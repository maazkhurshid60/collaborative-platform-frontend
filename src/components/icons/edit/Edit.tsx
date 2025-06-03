import ToolTip from "../../toolTip/ToolTip";

interface EditIconProps extends React.SVGProps<SVGSVGElement> {
    disabled?: boolean;
}

const EditIcon = ({ disabled = false, ...props }: EditIconProps) => (
    <div
        className={`relative group ${disabled ? "cursor-not-allowed opacity-50 pointer-events-none" : "cursor-pointer"}`}
    >
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M4.99919 13L4.99919 18C4.99919 18.5304 5.2099 19.0391 5.58497 19.4142C5.96004 19.7893 6.46875 20 6.99919 20L17.9992 20C18.5296 20 19.0383 19.7893 19.4134 19.4142C19.7885 19.0391 19.9992 18.5304 19.9992 18L19.9992 7C19.9992 6.46957 19.7885 5.96086 19.4134 5.58579C19.0383 5.21071 18.5296 5 17.9992 5L12.9992 5M3.58519 6.414C3.39416 6.22951 3.2418 6.00882 3.13698 5.76481C3.03216 5.5208 2.97699 5.25836 2.97468 4.9928C2.97238 4.72724 3.02298 4.46388 3.12354 4.21809C3.2241 3.9723 3.37261 3.749 3.56039 3.56121C3.74818 3.37343 3.97148 3.22492 4.21728 3.12436C4.46307 3.0238 4.72643 2.97319 4.99199 2.9755C5.25755 2.97781 5.51999 3.03298 5.76399 3.1378C6.008 3.24261 6.22869 3.39498 6.41319 3.586L14.9992 12.172L14.9992 15L12.1712 15L3.58519 6.414Z"
                stroke="#808B97"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>

        {!disabled && <ToolTip toolTipText="Update" />}
    </div>
);

export default EditIcon;
