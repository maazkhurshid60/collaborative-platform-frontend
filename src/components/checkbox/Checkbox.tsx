import React from 'react'

interface CheckboxProps {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    checked?: boolean
    text?: string
}

const Checkbox: React.FC<CheckboxProps> = ({ checked = false, onChange, text }) => {
    return (
        <div className='flex items-center gap-x-2.5'>
            <input
                type="checkbox"
                onChange={onChange}
                checked={checked}
                className="w-4 h-4 accent-greenColor appearance-none border border-[#808B97] rounded-sm checked:bg-greenColor checked:border-transparent checked:after:content-['✓'] checked:after:text-white checked:after:text-xs checked:after:block checked:after:text-center"
            />

            <p className='font-[Poppins] font-medium text-[14px] text-textColor'>{text}</p>

        </div>
    )
}

export default Checkbox