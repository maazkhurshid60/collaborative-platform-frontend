import React, { FC, SVGProps } from "react";

const InvoiceIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        {...props}
    >
        <path
            d="M2 6V8.42C2 10 3 11 4.58 11H8V4.01C8 2.9 7.09 2 5.98 2C4.89 2.01 3.89 2.45 3.17 3.17C2.45 3.9 2 4.9 2 6Z"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeMiterlimit={10}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M22 7V21C22 21.83 21.06 22.3 20.4 21.8L18.69 20.52C18.29 20.22 17.73 20.26 17.37 20.62L15.71 22.29C15.32 22.68 14.68 22.68 14.29 22.29L12.61 20.61C12.26 20.26 11.7 20.22 11.31 20.52L9.6 21.8C8.94 22.29 8 21.82 8 21V4C8 2.9 7.1 2 6 2H17H18C21 2 22 3.79 22 6V7Z"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeMiterlimit={10}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M15 13.01H12"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M15 9.01001H12"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M18.0039 13H17.9949"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M18.0039 9H17.9949"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default InvoiceIcon;