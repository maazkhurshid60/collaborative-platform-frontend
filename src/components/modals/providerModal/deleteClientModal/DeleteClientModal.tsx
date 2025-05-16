
import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { isModalDeleteReducer } from '../../../../redux/slices/ModalSlice'
import { AppDispatch } from '../../../../redux/store'
import { useDispatch } from 'react-redux'


interface DeleteModalProps {
    onDeleteConfirm?: () => void,
    text?: React.ReactNode
}


const deleteClientModalBody = (dispatch: AppDispatch, onDeleteConfirm: () => void, text: React.ReactNode) => {

    return <div className='w-[100%] m-auto'>
        <p className='text-center mt-10'>{text}</p>
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
        <ModalLayout heading='Delete Client' modalBodyContent={deleteClientModalBody(dispatch, props.onDeleteConfirm || (() => { }), props?.text)} />
    )
}

export default DeleteClientModal