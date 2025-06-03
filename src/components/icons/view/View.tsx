import ToolTip from "../../toolTip/ToolTip";

const ViewIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <div className="relative group cursor-pointer">

        <svg width="18" height="18" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M16.0001 17.8327C19.0858 17.8327 21.5872 15.221 21.5872 11.9993C21.5872 8.77769 19.0858 6.16602 16.0001 6.16602C12.9145 6.16602 10.4131 8.77769 10.4131 11.9993C10.4131 15.221 12.9145 17.8327 16.0001 17.8327Z" stroke="#808B97" stroke-width="2.5" />
            <path d="M29.0705 10.2238C29.6902 11.0093 30 11.402 30 12C30 12.598 29.6902 12.9907 29.0705 13.7762C26.8036 16.6498 21.8036 22 16 22C10.1963 22 5.19632 16.6498 2.92943 13.7762C2.30981 12.9907 2 12.598 2 12C2 11.402 2.30981 11.0093 2.92943 10.2238C5.19632 7.35023 10.1963 2 16 2C21.8036 2 26.8036 7.35023 29.0705 10.2238Z" stroke="#808B97" stroke-width="2.5" />
        </svg>
        <ToolTip toolTipText="View" />

    </div>


);

export default ViewIcon;
