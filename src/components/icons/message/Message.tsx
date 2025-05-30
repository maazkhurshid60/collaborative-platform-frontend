const MessageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M16 30C23.7319 30 30 23.7319 30 16C30 8.26801 23.7319 2 16 2C8.26801 2 2 8.26801 2 16C2 18.2396 2.52587 20.3562 3.46084 22.2335C3.70932 22.7323 3.79201 23.3025 3.64797 23.8408L2.81411 26.9574C2.45213 28.3102 3.68981 29.5478 5.04269 29.1859L8.15915 28.3521C8.6975 28.208 9.26769 28.2907 9.76654 28.5391C11.6437 29.4742 13.7604 30 16 30Z"
            stroke="currentColor"   // ✅ This allows dynamic color via parent stroke
            strokeWidth="2.5"
        />
    </svg>
);

export default MessageIcon;
