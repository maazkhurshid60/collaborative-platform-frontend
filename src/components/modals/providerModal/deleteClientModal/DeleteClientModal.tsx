
import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { isModalDeleteReducer } from '../../../../redux/slices/ModalSlice'
import { AppDispatch } from '../../../../redux/store'
import { useDispatch } from 'react-redux'


interface DeleteModalProps {
    onDeleteConfirm?: () => void
}


const deleteClientModalBody = (dispatch: AppDispatch, onDeleteConfirm: () => void) => {

    return <div className='w-[100%] m-auto'>
        <p className='text-center mt-10'>By Deleting this you account you won’t be able to restore this client. Are you sure that you want to Delete this Client?.</p>
        <div className='flex items-center justify-center gap-x-4 mt-10'>
            <div className='w-[100%]'>
                <Button text='Cancel' borderButton onclick={() => dispatch(isModalDeleteReducer(false))} />
            </div>
            <div className='w-[100%]'>
                <Button text='Delete' onclick={onDeleteConfirm} />
            </div>
        </div>
    </div>
}

const DeleteClientModal: React.FC<DeleteModalProps> = (props) => {
    const dispatch = useDispatch<AppDispatch>()
    return (
        <ModalLayout heading='Delete Client' modalBodyContent={deleteClientModalBody(dispatch, props.onDeleteConfirm || (() => { }))} />
    )
}

export default DeleteClientModal