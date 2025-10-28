import ModalLayout from '../../modalLayout/ModalLayout'
import Button from '../../../button/Button'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../../redux/store'
import { isModalDeleteReducer } from '../../../../redux/slices/ModalSlice'

interface VerifyAccountModalProps {
    onConfirm: () => void
    onCancel: () => void
}

const VerifyAccountModal: React.FC<VerifyAccountModalProps> = ({ onConfirm, onCancel }) => {
    const dispatch = useDispatch<AppDispatch>()

    const modalBody = (
        <div className='w-full m-auto'>
            <p className='text-center mt-10'>Are you sure you want to verify this account?</p>
            <div className='flex items-center justify-center gap-x-4 mt-10'>
                <div className='w-full'>
                    <Button
                        text='Cancel'
                        borderButton
                        onclick={() => {
                            dispatch(isModalDeleteReducer(false))
                            onCancel()
                        }}
                    />
                </div>
                <div className='w-full'>
                    <Button
                        text='Verify'
                        onclick={() => {
                            dispatch(isModalDeleteReducer(false))
                            onConfirm()
                        }}
                    />
                </div>
            </div>
        </div>
    )

    return <ModalLayout heading='Verify Account' modalBodyContent={modalBody} />
}

export default VerifyAccountModal
