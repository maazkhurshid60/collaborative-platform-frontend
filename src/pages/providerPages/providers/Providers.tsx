;
import OutletLayout from '../../../layouts/outletLayout/OutletLayout'
import Button from '../../../components/button/Button'

import usePaginationHook from '../../../hook/usePaginationHook';
import Table from '../../../components/table/Table';
import CustomPagination from '../../../components/customPagination/CustomPagination';

import { Link } from 'react-router-dom';
import Loader from '../../../components/loader/Loader';
import providerApiService from '../../../apiServices/providerApi/ProviderApi';
import { useQuery } from '@tanstack/react-query';
import { ProviderType } from '../../../types/providerType/ProviderType';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ViewIcon from '../../../components/icons/view/View';
import NoRecordFound from '../../../components/noRecordFound/NoRecordFound';

const Providers = () => {

    const heading = ["name", "CNIC", "gender", "email", "status", "clients", "action"]



    const loginUserDetail = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)

    const { data: providerData, isLoading, isError } = useQuery<ProviderType[]>({
        queryKey: ["providers"],
        queryFn: async () => {
            try {
                const response = await providerApiService.getAllProviders(loginUserDetail);
                return response?.data?.providers; // Ensure it always returns an array

            } catch (error) {
                console.error("Error fetching providers:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })


    const { totalPages,
        getCurrentRecords,
        handlePageChange, currentPage,
    } = usePaginationHook({ data: providerData ?? [], recordPerPage: 6 })
    console.log("providerData && providerData[0]?.clientList?.length", providerData && providerData[0]?.clientList?.length);

    const downloadXLS = (data: ProviderType[], fileName: string = "data.xls") => {
        const formattedData = data.map((provider) => ({
            Name: provider?.user?.fullName ?? "",
            CNIC: provider?.user?.cnic ?? "",
            Contact: provider?.user?.contactNo ?? "",
            Gender: provider?.user?.gender ?? "",
            Email: provider?.email ?? "",
            Status: provider?.user?.status ?? "",
            Role: provider?.user?.role ?? "",
            Address: provider?.user?.address ?? "",
            Clients: (provider?.clientList as { client: { user: { fullName: string } } }[])?.map(c =>
                c?.client?.user?.fullName ?? ""
            ).join(", ") || "No Clients"

        }));

        // blockedMembers String[]

        //creating Sheet from JSON 
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        // Workbook create karo aur Sheet usmein dalo
        const workbook = XLSX.utils.book_new();
        // Ek workbook matlab Excel file hoti hai. Uske andar ek ya zyada sheets hoti hain. Yahan hum ek "Sheet1" naam ki sheet daal rahe hain.
        XLSX.utils.book_append_sheet(workbook, worksheet, "Provider Data");
        const excelBuffer = XLSX.write(workbook, { bookType: "xls", type: "array" });
        const fileBlob = new Blob([excelBuffer], { type: "application/vnd.ms-excel" });
        saveAs(fileBlob, fileName);
    };

    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>somethingwent wrong</p>
    }
    // 
    const filteredData = getCurrentRecords()?.filter(data => !data?.user?.blockedMembers?.includes(loginUserDetail))

    return (
        <OutletLayout heading='Providers List' button={<Button text='Download xls' onclick={() => downloadXLS(getCurrentRecords())} />}>
            <div className='mt-10'>
                {filteredData?.length === 0 ? <NoRecordFound /> : <>
                    <Table heading={heading} >
                        {filteredData
                            .map((data: ProviderType, id: number) => (

                                <tr key={id} className={`border-b-[1px] border-b-solid border-b-lightGreyColor pb-4s`}>
                                    <td className="px-2 py-2">{data?.user?.fullName}</td>
                                    <td className="px-2 py-2">{data?.user?.cnic}</td>
                                    <td className="px-2 py-2">{data?.user?.gender}</td>
                                    <td className="px-2 py-2 lowercase">{data?.email}</td>
                                    <td className="px-2 py-2">{data?.user?.status}</td>
                                    <td className="px-2 py-2 w-[100px]">

                                        {data?.clientList?.length === 0 || data?.clientList === undefined
                                            ? <p>No Clients</p>
                                            : data?.clientList.map((provider: ProviderType, index) => (
                                                <p className='flex items-center gap-x-1  capitalize' key={index}>
                                                    {provider?.client?.user?.fullName}

                                                </p>
                                            ))
                                        }
                                    </td>


                                    <td className="px-2 py-2 flex items-center justify-start gap-x-2 relative">
                                        <Link to={`/providers/${data?.id}`}>
                                            <ViewIcon />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                    </Table>
                    <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} />
                </>}
            </div>
        </OutletLayout >)
}

export default Providers