import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../../redux/store'
import { isModalShowRejectReducer } from '../../../../redux/slices/ModalSlice'

interface RestoreAccountModalProps {
    onConfirm: () => void | Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

const RestoreAccountModal: React.FC<RestoreAccountModalProps> = ({ onConfirm, onCancel, isLoading = false }) => {
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
                        disabled={isLoading}
                    />
                </div>
                <div className='w-full'>
                    <Button
                        text='Restore'
                        onclick={() => {
                            onConfirm()
                        }}
                        isLoading={isLoading}
                        disabled={isLoading}
                    />
                </div>
            </div>
        </div>
    )

    return <ModalLayout
        heading='Restore Account'
        modalBodyContent={modalBody}
        onClose={() => {
            dispatch(isModalShowRejectReducer(false))
            onCancel()
        }}
    />
}

export default RestoreAccountModal
