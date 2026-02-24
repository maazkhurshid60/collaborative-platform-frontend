import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { subscriptionApiService } from "../../../../services/subscriptionApiService";
import Table from "../../../table/Table";
import CustomPagination from "../../../customPagination/CustomPagination";
import usePaginationHook from "../../../../hook/usePaginationHook";
import ViewIcon from "../../../icons/view/View";
import Loader from "../../../loader/Loader";
import NoRecordFound from "../../../noRecordFound/NoRecordFound";
import { useState } from "react";
import InvoiceModal from "../../../modals/InvoiceModal";

const SubscriptionHistoryCard = () => {
    const heading = ["Name", "Plan", "Price", "Next Billing", "Status", "Actions"];
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: billingHistory, isLoading } = useQuery({
        queryKey: ['payments'],
        queryFn: subscriptionApiService.getAllPayments
    });

    // Filter for paid history and map to requested columns
    const paidHistory = (billingHistory || []).filter((p: any) => p.status === 'paid');

    const recordPerPage = 4;
    const {
        totalPages,
        getCurrentRecords,
        handlePageChange,
        currentPage,
    } = usePaginationHook({ data: paidHistory, recordPerPage });

    const currentRecords = getCurrentRecords() ?? [];

    const handleViewInvoice = (payment: any) => {
        setSelectedInvoice(payment);
        setIsModalOpen(true);
    };

    if (isLoading) return <Loader text="Loading History..." />;

    return (
        <div className="mt-2">
            {paidHistory.length === 0 ? (
                <NoRecordFound />
            ) : (
                <>
                    <Table heading={heading}>
                        {currentRecords.map((data: any) => (
                            <tr key={data.id} className="border-b border-b-solid border-b-lightGreyColor whitespace-nowrap">
                                <td className="px-2 py-4">{data.billTo?.name || "-"}</td>
                                <td className="px-2 py-4 capitalize">{data.plan || "Standard"}</td>
                                <td className="px-2 py-4 ">{data.amount}</td>
                                <td className="px-2 py-4">{data.dueDate}</td>
                                <td className="px-2 py-4">
                                    <span className="px-3 py-1  text-black rounded-full text-xs  uppercase">
                                        {data.status}
                                    </span>
                                </td>
                                <td className="px-2 py-4">
                                    <button
                                        onClick={() => handleViewInvoice(data)}
                                        className="hover:scale-110 transition-transform text-primaryColorDark"
                                        title="View Invoice"
                                    >
                                        <ViewIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </Table>

                    <CustomPagination
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        hookCurrentPage={currentPage}
                    />

                    {selectedInvoice && (
                        <InvoiceModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            invoiceId={selectedInvoice.id}
                            invoiceData={selectedInvoice}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default SubscriptionHistoryCard;
