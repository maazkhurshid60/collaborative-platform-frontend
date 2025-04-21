;
import Table from '../../../table/Table'
import CustomPagination from '../../../customPagination/CustomPagination'
import usePaginationHook from '../../../../hook/usePaginationHook'
import { BsThreeDotsVertical } from "react-icons/bs";
import { useState } from 'react';

interface clientType {
    name?: string,
    clientId?: string,
    gender?: string,
    email: string,
    status?: string,
    providers: string[],
    cnic?: string
}
const ClientList = () => {
    const heading = ["name", "CNIC", "gender", "email", "status", "providers", "action"]

    const clientData = [{ name: "client1", cnic: "004343-245325235", gender: "Male", email: "client1@gmail.com", status: "Active", providers: ["provider1", "provider2"] },
    { name: "client2", cnic: "004343-245325235", gender: "Female", email: "client2@gmail.com", status: "Disable", providers: ["provider1", "provider2"] },
    { name: "client3", cnic: "004343-245325235", gender: "Male", email: "client3@gmail.com", status: "Active", providers: ["provider3", "provider4", "provider5"] },
    { name: "client4", cnic: "004343-245325235", gender: "Male", email: "client4@gmail.com", status: "Disable", providers: ["provider4"] },
    { name: "client5", cnic: "004343-245325235", gender: "Female", email: "client5@gmail.com", status: "Active", providers: ["provider2", "client1"] },
    { name: "client6", cnic: "004343-245325235", gender: "Male", email: "client6@gmail.com", status: "Active", providers: ["provider2", "client5"] },

    ]
    const [showActionOptions, setShowShowOptions] = useState<null | number>(null)
    const { totalPages,
        getCurrentRecords,
        handlePageChange, currentPage,
    } = usePaginationHook({ data: clientData, recordPerPage: 4 })
    console.log("totalpages", clientData[2]?.providers?.map(data => console.log(data.lastIndexOf)
    ));


    return (<>
        <div className='mt-2'>
            <Table heading={heading} >
                {getCurrentRecords()
                    .map((data: clientType, id: number) => (

                        <tr key={id} className={`border-b-[1px] border-b-solid border-b-lightGreyColor pb-4s`}>
                            <td className="px-2 py-2">{data.name}</td>
                            <td className="px-2 py-2">{data.cnic}</td>
                            <td className="px-2 py-2">{data.gender}</td>
                            <td className="px-2 py-2">{data.email}</td>
                            <td className="px-2 py-2">{data.status}</td>
                            <td className="px-2 py-2 w-[100px]">
                                {data.providers?.slice(0, 2).map((provider, id) => (
                                    <p key={id}>{provider}{id === 1 && data.providers.length > 2 ? ', ...' : ','}</p>
                                ))}
                            </td>


                            <td className="px-2 py-2 flex items-center justify-start gap-x-2 relative">
                                <BsThreeDotsVertical
                                    onClick={() => setShowShowOptions(prev => (prev === id ? null : id))}
                                    className='cursor-pointer'
                                />
                                {showActionOptions === id &&
                                    <ul className={`absolute top-0 -right-2 text-xs items-start flex bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out p-2 rounded-[10px] flex-col gap-y-2 ${showActionOptions === id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                                        }`}>

                                        <li className='cursor-pointer'>View</li>
                                        <li className='cursor-pointer'>Edit</li>{/* edit those client which are present in logined provider list */}
                                        <li className='cursor-pointer'>Delete</li> {/* delete those client which are present in logined provider list */}
                                    </ul>}

                            </td>
                        </tr>
                    ))}
            </Table>
            <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} />
        </div>

    </>


    )
}

export default ClientList













