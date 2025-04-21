import OutletLayout from '../../../../layouts/outletLayout/OutletLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import EditClientetails from '../editClientDetail/EditClientDetail'
import ShareClientDoc from '../shareClientDoc/ShareClientDoc'
import BackIcon from '../../../icons/back/Back'


const EditClient = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState(0)
    const tabData = ["Details", "Documents"]
    return (
        <OutletLayout heading='Update Client'>
            <div className='relative'>
                <div className='absolute  -left-6 -top-12 md:-top-14 lg:-left-5'>
                    <BackIcon onClick={() => navigate("/clients")} />
                </div>
            </div>
            <div className='flex items-center mt-4 w-[15%]'>
                {tabData.map((tab, id) => (
                    <p
                        key={id}
                        className={`w-1/2  cursor-pointer text-center transition-colors duration-300 ${activeTab === id ? 'text-textColor font-medium' : 'font-normal'
                            }`}
                        onClick={() => setActiveTab(id)}
                    >
                        {tab}
                    </p>
                ))}
            </div>
            <div className='relative'>
                <div className='relative w-[15%] '>
                    <hr className='text-textGreyColor/20 h-[2px] w-[100%] mt-2' />
                    <hr
                        className={`text-primaryColorDark h-[2px] w-1/2 mt-2 absolute -top-2 
                        transition-all duration-300 ease-in-out 
                        ${activeTab === 0 ? 'left-0' : 'left-1/2'}`}
                    />
                </div>
                <hr className='text-textGreyColor/30 h-[2px] w-[100%] mt-0 absolute -top-[0px]' />
            </div>

            {activeTab === 0 ? <EditClientetails id={id} /> : <ShareClientDoc />}
        </OutletLayout>
    )
}

export default EditClient