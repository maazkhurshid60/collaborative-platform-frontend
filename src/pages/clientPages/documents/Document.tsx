import OutletLayout from "../../../layouts/outletLayout/OutletLayout"
import usePaginationHook from "../../../hook/usePaginationHook"
import Table from "../../../components/table/Table"
import ViewIcon from "../../../components/icons/view/View"
import CustomPagination from "../../../components/customPagination/CustomPagination"
import DownloadIcon from "../../../components/icons/download/Download"
import UserIcon from "../../../components/icons/user/User"
import { GoDotFill } from "react-icons/go";
import ViewDocModal from "../../../components/modals/clientModal/viewDocModal/ViewDocModal"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../../../redux/store"
import { isModalShowReducser } from "../../../redux/slices/ModalSlice"
import { toast } from "react-toastify"

const data = [{
    docName: "Privacy Policy", doctype: "Consent", isAgree: true, date: "12/03/2025", shareBy: { name: "Provider1", email: "provider1@gmail.com" },
    docText: "There will be doc data will be displayed"
},
{

    docText: "There will be doc data will be displayed", docName: "Privacy Policy Consent", doctype: "Questionnaire", isAgree: false, date: "12/03/2025", shareBy: { name: "Provider1", email: "provider1@gmail.com" }
},
{

    docText: "There will be doc data will be displayed", docName: "What makes you think that you need help ", doctype: "Consent", isAgree: false, date: "12/03/2025", shareBy: { name: "Provider2", email: "provider2@gmail.com" }
},
{

    docText: "There will be doc data will be displayed", docName: "Privacy Policy", doctype: "Consent", isAgree: false, date: "12/03/2025", shareBy: { name: "Provider1", email: "provider1@gmail.com" }
},
{

    docText: "There will be doc data will be displayed", docName: "Privacy Policy", doctype: "Consent", isAgree: true, date: "12/03/2025", shareBy: { name: "Provider1", email: "provider1@gmail.com" }
},
{

    docText: "There will be doc data will be displayed", docName: "Privacy Policy", doctype: "Consent", isAgree: false, date: "12/03/2025", shareBy: { name: "Provider1", email: "provider1@gmail.com" }
},
{

    docText: "There will be doc data will be displayed", docName: "Privacy Policy", doctype: "Consent", isAgree: true, date: "12/03/2025", shareBy: { name: "Provider1", email: "provider1@gmail.com" }
},
{

    docText: "There will be doc data will be displayed", docName: "Privacy Policy", doctype: "Consent", isAgree: true, date: "12/03/2025", shareBy: { name: "Provider1", email: "provider1@gmail.com" }
},
{

    docText: "There will be doc data will be displayed", docName: "Privacy Policy", doctype: "Consent", isAgree: true, date: "12/03/2025", shareBy: { name: "Provider1", email: "provider1@gmail.com" }
},


]
const Document = () => {
    const heading = ["document", "type", "status", "date", "Shared by", "action"]
    const showModal = useSelector((state: RootState) => state.modalSlice.isModalShow)
    const dispatch = useDispatch<AppDispatch>()
    const { totalPages,
        getCurrentRecords,
        handlePageChange, currentPage,
    } = usePaginationHook({ data: data, recordPerPage: 7 })
    const [selectedDoc, setSelectedDoc] = useState("")
    return (
        <OutletLayout heading="Documents">
            {showModal
                &&
                <ViewDocModal sharedDocs={selectedDoc} />}

            <div className='mt-10 w-[100%]'>
                <Table heading={heading} >
                    {getCurrentRecords()
                        .map((data, id: number) => (

                            <tr key={id} className={`border-b-[1px] border-b-solid border-b-lightGreyColor pb-4`}>
                                <td className="px-2 py-2 font-semibold">{data.docName.length > 14
                                    ? data.docName
                                    : data.docName}</td>
                                <td className="px-2 py-2">{data.doctype}</td>
                                <td className="px-2 py-2 ">
                                    <p className={`p-1.5 w-auto  rounded-md text-sm ${data.isAgree ? "bg-primaryColorDark/20" : "bg-inputBgColor"}  flex items-center gap-x-3`}><span><GoDotFill className={`${data.isAgree ? "text-primaryColorDark" : "text-textColor"}`} /></span> {data.isAgree ? "Completed" : "Pending"}
                                    </p>
                                </td>
                                <td className="px-2 py-2">{data.date}</td>
                                <td className="px-2 py-2 m-auto">
                                    <div className="flex items-start gap-x-4">

                                        <UserIcon />
                                        <div className="text-left">
                                            <p>{data.shareBy.name}</p>
                                            <p> {data.shareBy.email}</p>
                                        </div>
                                    </div>
                                </td>



                                <td className="px-2 py-2 flex items-center justify-start gap-x-2 relative">
                                    <ViewIcon onClick={() => { setSelectedDoc(data?.docText); dispatch(isModalShowReducser(true)) }} />
                                    <DownloadIcon onClick={() => toast.success("This feature is comming soon.")} />

                                </td>
                            </tr>
                        ))}
                </Table>
                <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} />
            </div>


        </OutletLayout>
    )
}

export default Document