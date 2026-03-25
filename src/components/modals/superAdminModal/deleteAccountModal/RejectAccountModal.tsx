import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../../redux/store'
import { isModalShowRejectReducer } from '../../../../redux/slices/ModalSlice'

interface RejectAccountModalProps {
    onConfirm: () => void | Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

const RejectAccountModal: React.FC<RejectAccountModalProps> = ({ onConfirm, onCancel, isLoading = false }) => {
    const dispatch = useDispatch<AppDispatch>()

    const modalBody = (
        <div className='w-full m-auto'>
            <p className='text-center mt-10'>Are you sure you want to reject this account?</p>
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
                        text='Reject'
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

    return <ModalLayout heading='Reject Account' modalBodyContent={modalBody} />
}

export default RejectAccountModal
