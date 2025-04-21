
import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { isModalDeleteReducer } from '../../../../redux/slices/ModalSlice'
import { AppDispatch } from '../../../../redux/store'
import { useDispatch } from 'react-redux'

const deleteAccountModalBody = (dispatch: AppDispatch) => {

    return <div className='w-[100%] m-auto'>
        <p className='text-center mt-10'>By Deleting this you account you won’t be able to track record of your signed Documents. Are you sure that you want to Delete your Account?</p>
        <div className='flex items-center justify-center gap-x-4 mt-10'>
            <div className='w-[100%]'>
                <Button text='Cancel' borderButton onclick={() => dispatch(isModalDeleteReducer(false))} />
            </div>
            <div className='w-[100%]'>
                <Button text='Delete' onclick={() => dispatch(isModalDeleteReducer(false))} />
            </div>
        </div>
    </div>
}

const DeleteAccountModal = () => {
    const dispatch = useDispatch<AppDispatch>()
    return (
        <ModalLayout heading='Delete Account' modalBodyContent={deleteAccountModalBody(dispatch)} />
    )
}

export default DeleteAccountModal