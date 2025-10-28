
import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { isDeleteChannelModalShowReducer } from '../../../../redux/slices/ModalSlice'
import { AppDispatch } from '../../../../redux/store'
import { useDispatch } from 'react-redux'


interface DeleteModalProps {
    onDeleteConfirm?: () => void,
    text: React.ReactNode,
    heading: string
}


const DeleteChannelModalBody = (dispatch: AppDispatch, onDeleteConfirm: () => void, text: React.ReactNode) => {

    return <div className='w-[100%] m-auto'>
        <p className='text-center mt-10'>{text}</p>
        <div className='flex items-center justify-center gap-x-4 mt-10'>
            <div className='w-[100%]'>
                <Button text='Cancel' borderButton onclick={() => dispatch(isDeleteChannelModalShowReducer(false))
                } />
            </div>
            <div className='w-[100%]'>
                <Button text='Delete' onclick={onDeleteConfirm} />
            </div>
        </div>
    </div>
}

const DeleteChannelModal: React.FC<DeleteModalProps> = (props) => {
    const dispatch = useDispatch<AppDispatch>()
    return (
        <ModalLayout heading={props.heading} modalBodyContent={DeleteChannelModalBody(dispatch, props.onDeleteConfirm || (() => { }), props?.text)} />
    )
}

export default DeleteChannelModal