
import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import logo from '../../../public/assets/kolabme-logo.svg';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string | null;
    invoiceData?: any; // Add optional invoiceData prop
    autoDownload?: boolean; // Add autoDownload prop
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoiceId, invoiceData, autoDownload }) => {
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

    const handleDownloadPdf = async () => {
        if (!invoiceRef.current) return;

        try {
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`invoice-${invoice.invoiceNo}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            if (autoDownload) {
                onClose();
            }
        }
    };

    React.useEffect(() => {
        if (isOpen && autoDownload) {
            // Small delay to ensure render is complete and animations finished
            const timer = setTimeout(() => {
                handleDownloadPdf();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoDownload]);

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 overflow-y-auto ${autoDownload ? 'opacity-0 pointer-events-none' : 'bg-black/50'}`}>
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 relative my-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <div className='flex items-center gap-2 w-1/2 ml-12 justify-end'>
                            <h2 className="text-[24px] font-[Poppins] font-semibold" style={{ color: '#1f2937' }}>Invoice</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>
                    </div>
                    {/* Invoice Content (Target for PDF) */}
                    <div className="p-5 bg-white" ref={invoiceRef}>
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
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold mb-2 pb-2 border-b pl-2 pr-2" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                                <div className="col-span-4">Description</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-right">Price</div>
                                <div className="col-span-2 text-right">Amount</div>
                                <div className="col-span-2 text-right pr-2">Status</div>
                            </div>
                            {invoice.items.map((item: any, id: number) => (
                                <div key={id} className="grid grid-cols-12 gap-2 text-[10px] items-center py-2 pl-2 pr-2" style={{ color: '#4b5563' }}>
                                    <div className="col-span-4 pr-2">
                                        <p className="font-semibold truncate" style={{ color: '#111827' }}>{item.description}</p>
                                        <p className="text-[9px] truncate" style={{ color: '#6b7280' }}>{item.subtext}</p>
                                    </div>
                                    <div className="col-span-2 text-center font-medium">{item.qty}</div>
                                    <div className="col-span-2 text-right">{item.price}</div>
                                    <div className="col-span-2 text-right font-medium" style={{ color: '#111827' }}>{item.amount}</div>
                                    <div className="col-span-2 flex justify-end  pr-2">
                                        <span
                                            style={{
                                                backgroundColor: item.status.toLowerCase() === 'paid' ? '#dcfce7' : item.status.toLowerCase() === 'pending' ? '#fef9c3' : '#fee2e2',
                                                color: item.status.toLowerCase() === 'paid' ? '#15803d' : item.status.toLowerCase() === 'pending' ? '#a16207' : '#b91c1c',

                                            }}
                                            className="px-1.5 py-0.5 rounded text-[9px] font-medium whitespace-nowrap"
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
                                <div className="flex justify-between items-center text-[10px]" style={{ color: '#4b5563' }}>
                                    <span>Tax (0%):</span>
                                    <span>{invoice.tax}</span>
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
