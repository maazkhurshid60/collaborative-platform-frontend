
interface CardDashboardLayoutProps {
    children: React.ReactNode
    heading?: string
}
const CardDashboardLayout: React.FC<CardDashboardLayoutProps> = (props) => {
    return (
        <div className='bg-inputBgColor shadow-sm rounded-md p-4 w-[100%]'>
            <p className='headingMediumSmall'>{props.heading}</p>
            {props.children}
        </div>
    )
}

export default CardDashboardLayout