import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import superAdminApi from "../../../apiServices/superAdminApi/SuperAdminApi";
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Loader from "../../../components/loader/Loader";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import Table from "../../../components/table/Table";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import SearchBar from "../../../components/searchBar/SearchBar";
import { format } from "date-fns";
import ModalLayout from "../../../components/modals/modalLayout/ModalLayout";
import ViewIcon from "../../../components/icons/view/View";
import { useDebounce } from "../../../hook/useDebounce";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import Button from "../../../components/button/Button";

const AuditLogs = () => {
    const heading = ["User", "Action", "Resource", "Timestamp", "Action"];
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce search for 500ms
    const [page, setPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const limit = 10;

    const { data, isLoading } = useQuery({
        // Include debounced search term in queryKey to trigger fetch when it changes
        queryKey: ["auditLogs", page, debouncedSearchTerm],
        queryFn: async () => {
            const response = await superAdminApi.getAllAuditLogs({
                page,
                limit,
                search: debouncedSearchTerm, // Pass debounced search term to API
            });
            return response?.data;
        },
        staleTime: 1000 * 60 * 5, // Cache data for 5 minutes (data remains "fresh")
        gcTime: 1000 * 60 * 30, // Keep data in memory for 30 minutes even if unused
        refetchOnWindowFocus: false, // Prevents aggressive refetching when switching tabs
    });

    const logs = data?.logs || [];
    const totalPages = data?.pagination?.totalPages || 1;

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleViewDetails = (log: any) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const handleDownloadCSV = async () => {
        try {
            // Fetch a larger set of logs for the CSV export based on current filters
            const response = await superAdminApi.getAllAuditLogs({
                page: 1,
                limit: 2000, // Reasonable limit for a single CSV export
                search: debouncedSearchTerm
            });

            const logsToExport = response?.data?.logs || [];

            if (logsToExport.length === 0) {
                return;
            }

            const csvData = logsToExport.map((log: any) => ({
                "User Name": log.user?.fullName || "System",
                "Email": log.user?.email || "N/A",
                "Role": log.user?.role || "System",
                "Action": log.action,
                "Resource": log.resource,
                "Timestamp": format(new Date(log.timestamp), "MMM dd, yyyy hh:mm:ss a"),
                "Details (Metadata)": JSON.stringify(log.details)
            }));

            const worksheet = XLSX.utils.json_to_sheet(csvData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

            // Generate filename with current date
            const fileName = `AuditLogs_Export_${format(new Date(), "yyyy-MM-dd")}.csv`;
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error("CSV Download failed:", error);
        }
    };

    // Note: Admin exclusion is now handled in the backend for better performance and pagination accuracy.
    // We keep a safety filter here just in case.
    const filteredLogs = logs.filter((log: any) => log.user?.role !== "superAdmin");

    return (
        <OutletLayout heading="Audit Logs">
            {(isLoading) && <Loader text="Syncing Audit Trail..." />}

            {isModalOpen && selectedLog && (
                <ModalLayout
                    heading="Audit Log Details"
                    onClose={() => setIsModalOpen(false)}
                    modalBodyContent={
                        <div className="p-4 bg-gray-50 rounded-lg overflow-auto max-h-[60vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">User Identity</p>
                                    <p className="font-semibold text-gray-900">{selectedLog.user?.fullName || "System/Unknown"}</p>
                                    <p className="text-sm text-gray-600">{selectedLog.user?.email || "No email provided"}</p>
                                    <p className="text-xs text-gray-400">ID: {selectedLog.userId || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Event Action</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${selectedLog.action === 'LOGIN' ? 'bg-green-100 text-green-700' :
                                        selectedLog.action === 'LOGOUT' ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {selectedLog.action}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resource Category</p>
                                    <p className="font-medium text-gray-800">{selectedLog.resource}</p>
                                    <p className="text-xs text-gray-500">Resource ID: {selectedLog.resourceId || "None"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exact Timestamp</p>
                                    <p className="font-medium text-gray-800">
                                        {format(new Date(selectedLog.timestamp), "PPPP")}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {format(new Date(selectedLog.timestamp), "hh:mm:ss a")}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Technical Details (JSON Metadata)</p>
                                <div className="relative group">
                                    <pre className="bg-[#1e1e1e] text-blue-300 p-5 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed border border-gray-700 shadow-inner">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    }
                />
            )}

            <div className="flex items-center justify-end mt-4 gap-x-4">
                <div className="w-[150px]">
                    <Button
                        text="Export CSV"
                        onclick={handleDownloadCSV}
                        icon={<Download size={18} />}
                        borderButton
                        sm
                    />
                </div>
                <div className="w-[40%]">
                    <SearchBar
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search logs by user, action, or resource..."
                    />
                </div>
            </div>

            <div className="mt-10 w-full">
                {filteredLogs.length === 0 && !isLoading ? (
                    <NoRecordFound />
                ) : (
                    <>
                        <Table heading={heading}>
                            {filteredLogs.map((log: any) => (
                                <tr key={log.id} className="border-b border-b-solid border-b-lightGreyColor pb-4 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800">{log.user?.fullName || "System"}</span>
                                            <span className="text-xs text-gray-500">{log.user?.email || ""}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.action === 'LOGIN' ? 'bg-green-100 text-green-700' :
                                            log.action === 'LOGOUT' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">
                                            {log.resource}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {format(new Date(log.timestamp), "MMM dd, yyyy hh:mm:ss a")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-start">
                                            <ViewIcon onClick={() => handleViewDetails(log)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>

                        <CustomPagination
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            hookCurrentPage={page}
                        />
                    </>
                )}
            </div>
        </OutletLayout>
    );
};

export default AuditLogs;
