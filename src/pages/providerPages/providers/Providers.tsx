;
import OutletLayout from '../../../layouts/outletLayout/OutletLayout'
import Button from '../../../components/button/Button'

import usePaginationHook from '../../../hook/usePaginationHook';
import Table from '../../../components/table/Table';
import CustomPagination from '../../../components/customPagination/CustomPagination';

import { FaRegEye } from "react-icons/fa";
import { Link } from 'react-router-dom';

interface clientType {
    name?: string,
    clientId?: string,
    gender?: string,
    email: string,
    status?: string,
    providers: string[],
    cnic?: string
}
const Providers = () => {

    const heading = ["name", "CNIC", "gender", "email", "status", "clients", "actions"]

    const clientData = [{ name: "Provider1", cnic: "52435235-45 ", gender: "Male", email: "Provider1@gmail.com", status: "Active", providers: ["client1", "client2"] },
    { name: "Provider2", cnic: "52435235-45 ", gender: "Female", email: "Provider2@gmail.com", status: "Disable", providers: ["client1", "client2"] },
    { name: "Provider3", cnic: "52435235-45 ", gender: "Male", email: "Provider3@gmail.com", status: "Active", providers: ["client3", "client4", "client5"] },
    { name: "Provider4", cnic: "52435235-45 ", gender: "Male", email: "Provider4@gmail.com", status: "Disable", providers: ["client4"] },
    { name: "Provider5", cnic: "52435235-45 ", gender: "Female", email: "Provider5@gmail.com", status: "Active", providers: ["client2", "client1"] },
    { name: "Provider6", cnic: "52435235-45 ", gender: "Male", email: "Provider6@gmail.com", status: "Active", providers: ["client2", "client5"] },

    ]

    const { totalPages,
        getCurrentRecords,
        handlePageChange, currentPage,
    } = usePaginationHook({ data: clientData, recordPerPage: 8 })
    console.log("totalpages", clientData[2]?.providers?.map(data => console.log(data.lastIndexOf)
    ));

    return (
        <OutletLayout heading='Provider List' button={<Button text='Download xls' />}>
            <div className='mt-10'>
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
                                    {data.providers?.slice(0, 3).map((provider, id) => (
                                        <p key={id}>{provider}{id === 2 && data.providers.length > 2 ? ', ...' : ','}</p>
                                    ))}
                                </td>


                                <td className="px-2 py-2 flex items-center justify-start gap-x-2 relative">
                                    <Link to={`/providers/${id}`}>
                                        <FaRegEye size={18} className='cursor-pointer  text-textGreyColor' />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                </Table>
                <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} />
            </div>
        </OutletLayout >)
}

export default Providers