import { useState } from 'react'
import OutletLayout from '../../../layouts/outletLayout/OutletLayout'
import { RiArrowLeftSLine } from 'react-icons/ri'

const HelpAndSupport = () => {
    const data = [{
        name: "What's New",
        data: ["Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
            "when an unknown printer took a galley of type and scrambled it to make a type specimen book."
        ]
    },
    {
        name: "Sign-in Issues",
        data: ["It has survived not only five centuries.",
            "but also the leap into electronic typesetting.",
            "remaining essentially unchanged."
        ]
    },
    {
        name: "Who can use this platform",
        data: ["It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages."]
    },
    {
        name: "Can I know how many members does it supports?",
        data: ["Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
            "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
            "when an unknown printer took a galley of type and scrambled it to make a type specimen book."
        ]
    },
    {
        name: "How to add designation and department?",
        data: ["It has survived not only five centuries.",
            "but also the leap into electronic typesetting.",
            "remaining essentially unchanged."
        ]
    }
        ,
    {
        name: "How restrict offensive messages?",
        data: ["It has survived not only five centuries.",
            "but also the leap into electronic typesetting.",
            "remaining essentially unchanged."
        ]
    }
        ,
    {
        name: "How do I delete my account?",
        data: [" It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages."]

    }

    ]

    const [isOpen, setIsOpen] = useState<number | null>(0)

    return (
        <OutletLayout heading='Help and support'>
            {data?.map((data, id: number) =>
                <div className='bg-inputBgColor p-2 rounded-[10px] text-textColor mt-4' key={id}>
                    <div className='flex items-center justify-between '>
                        <p className='text-[14px] md:text-[16px] font-medium w-[90%] '>{data.name}</p>
                        <RiArrowLeftSLine
                            onClick={() => setIsOpen(prev => (prev === id ? null : id))}
                            className={`text-xl sm:text-2xl md:text-3xl transition-transform duration-300 text-textGreyColor cursor-pointer ${isOpen === id ? "-rotate-90" : "rotate-180"}`}
                        />                    </div>
                    {data?.data?.map((data, index: number) => <p className={`${isOpen === id ? "block" : "hidden"} mt-2 text-xs md:text-sm`}>
                        {index + 1}- {data}
                    </p>)}

                </div>
            )}

        </OutletLayout>
    )
}

export default HelpAndSupport 