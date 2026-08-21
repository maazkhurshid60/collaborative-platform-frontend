import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import superAdminApi from "../../../apiServices/superAdminApi/SuperAdminApi";
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
import { Download, Video, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import Button from "../../../components/button/Button";
import Dropdown from "../../../components/dropdown/Dropdown";

const heading = [
  "Guest / Patient",
  "Provider",
  "Type",
  "Scheduled Date & Time",
  "Status",
  "Action",
];

const statusOptions = ["ALL", "CONFIRMED", "PENDING", "CANCELLED", "DECLINED"];

const statusSelectOptions = statusOptions.map((st) => ({
  value: st,
  label: st === "ALL" ? "ALL" : st,
}));

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700 border-green-300";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-300";
    case "DECLINED":
      return "bg-gray-100 text-gray-700 border-gray-300";
    default:
      return "bg-blue-100 text-blue-700 border-blue-300";
  }
};

const limit = 10;

export const MeetingsAuditSection = () => {
  const { control } = useForm<{ status: string }>({
    defaultValues: {
      status: "ALL",
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["meetingsAudit", page, debouncedSearchTerm, selectedStatus],
    queryFn: async () => {
      const response = await superAdminApi.getAllAppointments({
        page,
        limit,
        search: debouncedSearchTerm,
        status: selectedStatus,
      });
      return response?.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const downloadCsvMutation = useMutation({
    mutationFn: async () => {
      setExportError(null);
      const response = await superAdminApi.getAllAppointments({
        page: 1,
        limit: 2000,
        search: debouncedSearchTerm,
        status: selectedStatus,
      });

      const recordsToExport = response?.data?.appointments || [];
      if (recordsToExport.length === 0) {
        throw new Error(
          "No meeting audit logs available to export for the selected filter.",
        );
      }

      const csvData = recordsToExport.map((appt: any) => ({
        "Guest Name": appt.guestName,
        "Guest Email": appt.guestEmail,
        "Guest Phone": appt.guestPhone || "N/A",
        "Provider Name": appt.provider?.user?.fullName || "N/A",
        "Provider Email": appt.provider?.user?.email || "N/A",
        "Session Type": appt.sessionType,
        Status: appt.status,
        "Start Time": format(new Date(appt.startTime), "MMM dd, yyyy hh:mm a"),
        "End Time": format(new Date(appt.endTime), "MMM dd, yyyy hh:mm a"),
        "Call Activity Logs":
          appt.callLogs
            ?.map(
              (l: any) =>
                `${l.role}:${l.event}@${format(new Date(l.occurredAt), "HH:mm:ss")}`,
            )
            .join(" | ") || "None",
      }));

      const worksheet = XLSX.utils.json_to_sheet(csvData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Meetings & Appointments",
      );

      const fileName = `Meetings_Audit_${format(new Date(), "yyyy-MM-dd")}.csv`;
      XLSX.writeFile(workbook, fileName);
    },
    onError: (err: any) => {
      const msg =
        err?.message || "Failed to export CSV. Please try again later.";
      setExportError(msg);
      setTimeout(() => setExportError(null), 6000);
    },
  });

  const appointments = data?.appointments || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewDetails = (appt: any) => {
    setSelectedAppointment(appt);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guest or provider name/email..."
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="min-w-37.5 sm:min-w-42.5">
            <Dropdown
              name="status"
              label=""
              control={control}
              options={statusSelectOptions}
              placeholder="Filter by Status"
              onChange={(opt) => {
                setSelectedStatus(opt.value);
                setPage(1);
              }}
            />
          </div>

          <Button
            onclick={() => downloadCsvMutation.mutate()}
            disabled={downloadCsvMutation.isPending}
            borderButton
            className="px-3"
            icon={
              downloadCsvMutation.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )
            }
            text={
              downloadCsvMutation.isPending ? " Exporting..." : " Export CSV"
            }
          />
        </div>
      </div>

      {exportError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{exportError}</span>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            Failed to load meeting audit logs:{" "}
            {(error as any)?.message || "Server connection error."}
          </span>
        </div>
      )}

      {isLoading ? (
        <Loader text="Loading Meeting Audits..." />
      ) : appointments.length === 0 ? (
        <NoRecordFound />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table heading={heading}>
            {appointments.map((appt: any) => (
              <tr
                key={appt.id}
                className="hover:bg-gray-50 border-b border-gray-100 text-sm"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">
                    {appt.guestName}
                  </div>
                  <div className="text-xs text-gray-500">{appt.guestEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">
                    {appt.provider?.user?.fullName || "Unassigned"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {appt.provider?.user?.email || ""}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                    {appt.sessionType === "ONLINE" ? (
                      <>
                        <Video size={14} className="text-[#2CB3A8]" />
                        Online Video
                      </>
                    ) : (
                      <>
                        <MapPin size={14} className="text-amber-600" />
                        In Person
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                  <div>{format(new Date(appt.startTime), "MMM dd, yyyy")}</div>
                  <div className="text-gray-400">
                    {format(new Date(appt.startTime), "hh:mm a")} -{" "}
                    {format(new Date(appt.endTime), "hh:mm a")}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(appt.status)}`}
                  >
                    {appt.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleViewDetails(appt)}
                    className="p-1.5 text-gray-600 hover:text-[#2CB3A8] transition-colors rounded-md hover:bg-gray-100"
                    title="View Meeting Details & Call Audit Trail"
                  >
                    <ViewIcon />
                  </button>
                </td>
              </tr>
            ))}
          </Table>

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <CustomPagination
                hookCurrentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {isModalOpen && selectedAppointment && (
        <ModalLayout
          heading="Meeting & Call Audit Details"
          onClose={() => setIsModalOpen(false)}
          modalBodyContent={
            <div className="p-4 bg-gray-50 rounded-lg max-h-[65vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Guest / Patient:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedAppointment.guestName}
                  </span>
                  <div className="text-gray-500">
                    {selectedAppointment.guestEmail}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block">Provider:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedAppointment.provider?.user?.fullName || "N/A"}
                  </span>
                  <div className="text-gray-500">
                    {selectedAppointment.provider?.user?.email}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 block">Session Type:</span>
                  <span className="font-semibold">
                    {selectedAppointment.sessionType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Status:</span>
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs rounded border ${getStatusBadgeClass(selectedAppointment.status)}`}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block">Scheduled Time:</span>
                  <span className="font-medium text-gray-800">
                    {format(new Date(selectedAppointment.startTime), "PPpp")}{" "}
                    &ndash; {format(new Date(selectedAppointment.endTime), "p")}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  WebRTC Call Activity Audit Logs
                </h3>
                {!selectedAppointment.callLogs ||
                selectedAppointment.callLogs.length === 0 ? (
                  <p className="text-xs text-gray-500 italic bg-white p-3 rounded-lg border border-gray-200">
                    No WebRTC video call activity was recorded for this
                    appointment.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
                    {selectedAppointment.callLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2 rounded bg-white border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold uppercase text-gray-700">
                            {log.role}
                          </span>
                          <span className="text-gray-500">&bull;</span>
                          <span className="font-mono text-[#2CB3A8] font-bold">
                            {log.event}
                          </span>
                        </div>
                        <span className="text-gray-400 font-mono text-[11px]">
                          {format(
                            new Date(log.occurredAt),
                            "HH:mm:ss (MMM dd)",
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          }
        />
      )}
    </div>
  );
};

export default MeetingsAuditSection;
