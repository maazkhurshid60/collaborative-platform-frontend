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
import DownloadIcon from "../../../icons/download/Download";

const SubscriptionHistoryCard = () => {
    const heading = ["Name", "Plan", "Price", "Next Billing", "Status", "Actions"];
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAutoDownload, setIsAutoDownload] = useState(false);

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
        setIsAutoDownload(false);
        setSelectedInvoice(payment);
        setIsModalOpen(true);
    };

    const handleDownloadInvoice = (payment: any) => {
        setIsAutoDownload(true);
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
                                <td className="px-4 py-3">{data.billTo?.name || "-"}</td>
                                <td className="px-4 py-3 capitalize">{data.plan || "Standard"}</td>
                                <td className="px-4 py-3 ">{data.amount}</td>
                                <td className="px-4 py-3">{data.dueDate}</td>
                                <td className="px-4 py-3">
                                    <span className="px-3 py-1  text-black rounded-full text-xs  uppercase">
                                        {data.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleViewInvoice(data)}
                                            className=" text-primaryColorDark"
                                            title="View Invoice"
                                        >
                                            <ViewIcon />
                                        </button>
                                        <button
                                            onClick={() => handleDownloadInvoice(data)}
                                            className=" text-primaryColorDark cursor-pointer"
                                            title="Download Invoice"
                                        >
                                            <DownloadIcon className="w-[18px] h-[18px] object-cover" />
                                        </button>
                                    </div>
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
                            autoDownload={isAutoDownload}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default SubscriptionHistoryCard;

