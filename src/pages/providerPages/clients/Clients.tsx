;
import OutletLayout from '../../../layouts/outletLayout/OutletLayout'
import Button from '../../../components/button/Button'

import usePaginationHook from '../../../hook/usePaginationHook';
import Table from '../../../components/table/Table';
import CustomPagination from '../../../components/customPagination/CustomPagination';
import EditIcon from '../../../components/icons/edit/Edit';
import DeleteIcon from '../../../components/icons/delete/DeleteIcon';
import { useNavigate } from 'react-router-dom';
import { clientData } from './DummyData';
import DeleteClientModal from '../../../components/modals/providerModal/deleteClientModal/DeleteClientModal';
import { useDispatch, useSelector } from 'react-redux';
import { isModalDeleteReducer } from '../../../redux/slices/ModalSlice';
import { AppDispatch, RootState } from '../../../redux/store';

interface clientType {
    name?: string,
    clientId?: string,
    gender?: string,
    email: string,
    status?: string,
    providers: string[],
    cnic?: string
}
const Clients = () => {

    const heading = ["name", "CNIC", "gender", "email", "status", "providers", "action"]

    const isShowDeleteModal = useSelector((state: RootState) => state.modalSlice.isModalDelete)


    const { totalPages,
        getCurrentRecords,
        handlePageChange, currentPage,
    } = usePaginationHook({ data: clientData, recordPerPage: 8 })
    console.log("totalpages", clientData[2]?.providers?.map(data => console.log(data.lastIndexOf)
    ));
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    return (
        <OutletLayout heading='Client List' button={<Button text='Add' onclick={() => navigate("add-client")} />}>
            {isShowDeleteModal && <DeleteClientModal />}
            <div className='mt-10 w-[100%]'>
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

                                    <EditIcon onClick={() => { navigate(`/clients/edit-client/${id}`) }} />{/* edit those client which are present in logined provider list */}
                                    <DeleteIcon onClick={() => dispatch(isModalDeleteReducer(true))} />{/* delete those client which are present in logined provider list */}

                                </td>
                            </tr>
                        ))}
                </Table>
                <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} />
            </div>
        </OutletLayout >)
}

export default Clients