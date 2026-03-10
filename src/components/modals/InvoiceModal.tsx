
import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';

import logo from '../../../public/assets/logo.png';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string | null;
    invoiceData?: any; // Add optional invoiceData prop
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoiceId, invoiceData }) => {
    const invoiceRef = useRef<HTMLDivElement>(null);

    // Use passed data or fallback to mock/fetch
    const invoice = React.useMemo(() => {
        return invoiceData || {
            invoiceNo: invoiceId ? `${invoiceId.padStart(4, '0')}` : "INV-2024-8472",
            date: "February 15, 2024",
            dueDate: "February 15, 2024",
            billTo: {
                name: "John Doe",
                email: "john.doe@email.com",
                address: "456 Customer Avenue",
                city: "New York, NY 10001"
            },
            items: [
                {
                    description: "Professional Plan",
                    subtext: "Monthly subscription",
                    qty: "01",
                    price: "$49.00",
                    amount: "$49.00",
                    status: "Paid"
                }
            ],
            subtotal: "$49.00",
            tax: "$0.00",
            total: "$49.00",
            notes: "Thank you for your business! Your subscription will automatically renew on March 15, 2025. If you have any questions about this invoice, please contact our support team."
        };
    }, [invoiceData, invoiceId]);

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 overflow-y-auto bg-black/50`}>
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    ref={invoiceRef}
                    className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 relative my-auto"
                >


                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <div className='flex items-center gap-2 w-1/2 ml-12 justify-end'>
                            <h2 className="text-[24px] font-[Poppins] font-semibold" style={{ color: '#1f2937' }}>Invoice</h2>
                        </div>
                        {/* data-html2canvas-ignore hides the close button in the PDF */}
                        <div className="flex items-center gap-2" data-html2canvas-ignore="true">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>
                    </div>
                    {/* Invoice Content */}
                    <div className="p-5 bg-white">
                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col gap-1">
                                <img src={logo} alt="Kolabme" className="h-7 w-fit object-contain mb-1" />
                                <div className="text-xs font-normal font-[Poppins] space-y-0.5" style={{ color: '#6b7280' }}>
                                    <p>123 Business Street</p>
                                    <p>San Francisco, CA 94102</p>
                                    <p>support@example.com</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-xl font-bold mb-1" style={{ color: '#111827' }}>INVOICE</h1>
                                <div className="text-[10px] font-normal font-[Poppins] space-y-0.5" style={{ color: '#4b5563' }}>
                                    <p><span className="font-medium" style={{ color: '#6b7280' }}>Invoice #:</span> {invoice.invoiceNo}</p>
                                    <p><span className="font-medium" style={{ color: '#6b7280' }}>Date:</span> {invoice.date}</p>
                                    <p><span className="font-medium" style={{ color: '#6b7280' }}>Due Date:</span> {invoice.dueDate}</p>
                                </div>
                            </div>
                        </div>
                        {/* Bill To */}
                        <div className="mb-4">
                            <h3 className="text-sm font-bold font-[Poppins] mb-0.5" style={{ color: '#111827' }}>Bill To:</h3>
                            <div className="text-[11px]" style={{ color: '#4b5563' }}>
                                <p className="font-medium font-[Poppins]" style={{ color: '#111827' }}>{invoice.billTo.name}</p>
                                <p>{invoice.billTo.email}</p>
                                <p>{invoice.billTo.address} {invoice.billTo.city}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="bg-[#F9FAFB] rounded-[8px] p-4 mb-4">
                            <div className="grid grid-cols-12 gap-2 text-[10px] items-center font-bold mb-2 pb-2 border-b px-2" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                                <div className="col-span-4">Description</div>
                                <div className="col-span-2 flex justify-center">Qty</div>
                                <div className="col-span-2 flex justify-center">Price</div>
                                <div className="col-span-2 flex justify-center">Amount</div>
                                <div className="col-span-2 flex justify-center">Status</div>
                            </div>
                            {invoice.items.map((item: any, id: number) => (
                                <div key={id} className="grid grid-cols-12 gap-2 text-[10px] items-center py-2 px-2" style={{ color: '#4b5563' }}>
                                    <div className="col-span-4">
                                        <p className="font-semibold truncate" style={{ color: '#111827' }}>{item.description}</p>
                                        <p className="text-[9px] truncate" style={{ color: '#6b7280' }}>{item.subtext}</p>
                                    </div>
                                    <div className="col-span-2 flex justify-center font-medium">{item.qty}</div>
                                    <div className="col-span-2 flex justify-center">{item.price}</div>
                                    <div className="col-span-2 flex justify-center font-medium" style={{ color: '#111827' }}>{item.amount}</div>
                                    <div className="col-span-2 flex justify-center status-container">
                                        <span
                                            style={{
                                                backgroundColor: ((item?.status || '').toLowerCase() === 'paid' ? '#dcfce7' : (item?.status || '').toLowerCase() === 'pending' ? '#fef9c3' : '#fee2e2'),
                                                color: (item?.status || '').toLowerCase() === 'paid' ? '#15803d' : (item?.status || '').toLowerCase() === 'pending' ? '#a16207' : '#b91c1c',

                                            }}
                                            className="status-badge inline-block px-1.5 py-0.5 rounded text-[9px] font-medium whitespace-nowrap"
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="flex flex-col items-start justify-between w-full mb-4">
                            <div className="w-full space-y-1.5">
                                <div className="flex justify-between items-center text-[10px]" style={{ color: '#4b5563' }}>
                                    <span>Subtotal:</span>
                                    <span>{invoice.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold pt-2 border-t" style={{ borderColor: '#e5e7eb' }}>
                                    <span style={{ color: '#111827' }}>Total:</span>
                                    <span style={{ color: '#0d9488' }} className='font-normal font-[poppins]'>{invoice.total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Notes */}
                        <div className="text-[10px]" style={{ color: '#4b5563' }}>
                            <h4 className="font-bold mb-1" style={{ color: '#111827' }}>Notes:</h4>
                            <p className="leading-tight">{invoice.notes}</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>

    );
};

export default InvoiceModal;
