
interface CardDashboardLayoutProps {
    children: React.ReactNode
    heading?: string
}
const CardDashboardLayout: React.FC<CardDashboardLayoutProps> = (props) => {
    return (
        <div className='bg-inputBgColor rounded-md p-4 h-[100%] w-[100%]'>
            <p className='headingMediumSmall'>{props.heading}</p>
            {props.children}
        </div>
    )
}

export default CardDashboardLayout