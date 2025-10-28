import React from 'react'
interface SpinnerLoaderProps {
    text: string
}
const SpinnerLoader: React.FC<SpinnerLoaderProps> = (props) => {
    return (
        <div className="flex items-center justify-center text-gray-500 text-sm mt-4">
            <svg
                className="w-4 h-4 animate-spin text-primaryColorDark mr-2"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                />
            </svg>
            {props.text}...
        </div>
    )
}

export default SpinnerLoader