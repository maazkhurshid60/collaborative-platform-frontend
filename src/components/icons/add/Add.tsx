import React from 'react'
import { IoIosAddCircleOutline } from 'react-icons/io'
interface AddIconProps {
    onClick?: () => void
}
const AddIcon: React.FC<AddIconProps> = (props) => {
    return (
        <IoIosAddCircleOutline className='cursor-pointer text-xl text-textGreyColor'
            onClick={props.onClick}
        />

    )
}

export default AddIcon