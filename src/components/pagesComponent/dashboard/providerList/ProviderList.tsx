
import Table from '../../../table/Table'
import CustomPagination from '../../../customPagination/CustomPagination'
import usePaginationHook from '../../../../hook/usePaginationHook'
import { useQuery } from '@tanstack/react-query'
import { Client, ProviderType } from '../../../../types/providerType/ProviderType'
import providerApiService from '../../../../apiServices/providerApi/ProviderApi'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../redux/store'
import Loader from '../../../loader/Loader'
import NoRecordFound from '../../../noRecordFound/NoRecordFound'
import { useNavigate } from 'react-router-dom'

const ProviderList = () => {
    const heading = ["S.No", "name", "license Number", "email", "status", "clients"]
    const loginUserDetail = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)

    const navigate = useNavigate()
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
    } = usePaginationHook({ data: providerData ?? [], recordPerPage: 4 })
    const filteredData = getCurrentRecords()?.filter(data => !data?.user?.blockedMembers?.includes(loginUserDetail))


    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>somethingwent wrong</p>
    }
    return (<>
        <div className='mt-2'>
            {filteredData?.length === 0 ? <NoRecordFound /> : <>
                <Table heading={heading} >
                    {filteredData
                        .map((data: ProviderType, id: number) => (

                            <tr key={id} className={`border-b-[1px] border-b-solid border-b-lightGreyColor pb-4s`}>
                                <td className="px-2 py-2">{id + 1}</td>
                                <td className="px-2 py-2">{data?.user?.fullName}</td>
                                <td className="px-2 py-2">{data?.user?.licenseNo}</td>
                                <td className="px-2 py-2 lowercase">{data?.email}</td>
                                <td className="px-2 py-2">{data?.department}</td>
                                <td className="px-2 py-2 w-[100px]">
                                    {data?.clientList === undefined ||
                                        data?.clientList?.filter((p: Client) => p?.client?.clientShowToOthers === true).length === 0 ? (
                                        <p>No Clients</p>
                                    ) : (
                                        <>
                                            {data?.clientList
                                                .filter((client: Client) => client?.client?.clientShowToOthers === true)
                                                .slice(0, 2)
                                                .map((client: Client, index) => (
                                                    <p className="flex items-center gap-x-1 capitalize" key={index}>
                                                        {client?.client?.user?.fullName}
                                                    </p>
                                                ))}

                                            {data?.clientList.filter((p: Client) => p?.client?.clientShowToOthers === true).length > 2 && (
                                                <p
                                                    className="text-primaryColor cursor-pointer mt-1 text-primaryColorDark"
                                                    onClick={() => navigate(`/providers/${data?.id}`)}
                                                >
                                                    ... View All
                                                </p>
                                            )}
                                        </>
                                    )}
                                </td>





                            </tr>
                        ))}
                </Table>
                <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} /></>}

        </div>
    </>


    )
}

export default ProviderList