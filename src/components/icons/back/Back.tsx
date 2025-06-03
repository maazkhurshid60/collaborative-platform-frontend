import ToolTip from "../../toolTip/ToolTip";



const BackIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <div className="relative group cursor-pointer">



        <svg width="24" height="24" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g filter="url(#filter0_d_1042_11092)">
                <circle cx="20.5" cy="16.5" r="16.5" fill="white" />
                <path d="M24.0017 25.5726C24.2251 25.7757 24.5704 25.7554 24.7736 25.532C24.9767 25.3086 24.9564 24.9632 24.7329 24.7601L16.872 17.6507C16.6689 17.4679 16.6689 17.2039 16.872 17.0211L24.7329 10.1554C24.9564 9.9523 24.9767 9.60699 24.7939 9.38355C24.5907 9.16012 24.2454 9.1398 24.022 9.32262L16.161 16.2086C15.4704 16.8179 15.4501 17.8336 16.1407 18.4632L24.0017 25.5726Z" fill="#434459" />
            </g>
            <defs>
                <filter id="filter0_d_1042_11092" x="0" y="0" width="41" height="41" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1042_11092" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1042_11092" result="shape" />
                </filter>
            </defs>
        </svg>

        <ToolTip toolTipText="View" />

    </div>


);

export default BackIcon

