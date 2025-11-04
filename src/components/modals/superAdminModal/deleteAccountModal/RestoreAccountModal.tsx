import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../../redux/store'
import { isModalShowRejectReducer } from '../../../../redux/slices/ModalSlice'

interface RestoreAccountModalProps {
    onConfirm: () => void
    onCancel: () => void
}

const RestoreAccountModal: React.FC<RestoreAccountModalProps> = ({ onConfirm, onCancel }) => {
    const dispatch = useDispatch<AppDispatch>()

    const modalBody = (
        <div className='w-full m-auto'>
            <p className='text-center mt-10'>Are you sure you want to restore this account?</p>
            <div className='flex items-center justify-center gap-x-4 mt-10'>
                <div className='w-full'>
                    <Button
                        text='Cancel'
                        borderButton
                        onclick={() => {
                            dispatch(isModalShowRejectReducer(false))
                            onCancel()
                        }}
                    />
                </div>
                <div className='w-full'>
                    <Button
                        text='Restore'
                        onclick={() => {
                            dispatch(isModalShowRejectReducer(false))
                            onConfirm()
                        }}
                    />
                </div>
            </div>
        </div>
    )

    return  <ModalLayout
            heading='Restore Account'
            modalBodyContent={modalBody}
            onClose={() => {
                dispatch(isModalShowRejectReducer(false))
                onCancel() 
            }}
        />
}

export default RestoreAccountModal
