import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Search } from "lucide-react";
import { subscriptionApiService } from "../../../services/subscriptionApiService";

const AdminInvoices = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: invoices, isLoading } = useQuery({
        queryKey: ['adminCalls'],
        queryFn: () => subscriptionApiService.getAllInvoicesAdmin()
    });

    const filteredInvoices = invoices?.filter((inv: any) =>
        inv.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 font-[Poppins]">
            <h1 className="text-2xl font-bold mb-6">All Invoices</h1>

            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by provider name or email..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2C9993] outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
                        ) : filteredInvoices?.map((inv: any) => (
                            <tr key={inv.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{inv.user.fullName}</div>
                                    <div className="text-sm text-gray-500">{inv.user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(inv.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {inv.currency.toUpperCase()} {inv.amount}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-[#2C9993] hover:underline cursor-pointer">
                                    <a href={inv.invoiceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                        View <Download size={14} />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminInvoices;
