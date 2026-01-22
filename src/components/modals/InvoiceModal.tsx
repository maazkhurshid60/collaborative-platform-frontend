
import React, { useRef, useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../../../public/assets/kolabme-logo.svg';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string | null;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoiceId }) => {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Mock Data for specific invoice IDs or fallback
    const getInvoiceData = (id: string | null) => {
        // You can extend this with a real find based on ID
        return {
            invoiceNo: id ? `INV-2024-${id.padStart(4, '0')}` : "INV-2024-8472",
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
    };

    const invoice = getInvoiceData(invoiceId);

    const handleDownloadPdf = async () => {
        if (!invoiceRef.current) return;
        setIsDownloading(true);

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
            setIsDownloading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="flex min-h-full justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 relative my-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">Invoice</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Invoice Content (Target for PDF) */}
                    <div className="p-8 bg-white" ref={invoiceRef}>
                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-12">
                            <div className="flex flex-col gap-2">
                                <img src={logo} alt="Kolabme" className="h-10 w-fit object-contain mb-2" />
                                <div className="text-sm text-gray-500 space-y-1">
                                    <p>123 Business Street</p>
                                    <p>San Francisco, CA 94102</p>
                                    <p>support@example.com</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">INVOICE</h1>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><span className="font-medium text-gray-500">Invoice #:</span> {invoice.invoiceNo}</p>
                                    <p><span className="font-medium text-gray-500">Date:</span> {invoice.date}</p>
                                    <p><span className="font-medium text-gray-500">Due Date:</span> {invoice.dueDate}</p>
                                </div>
                            </div>
                        </div>
                        {/* Bill To */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Bill To:</h3>
                            <div className="text-sm text-gray-600">
                                <p className="font-medium text-gray-900">{invoice.billTo.name}</p>
                                <p>{invoice.billTo.email}</p>
                                <p>{invoice.billTo.address}</p>
                                <p>{invoice.billTo.city}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <div className="grid grid-cols-12 gap-4 text-sm font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">
                                <div className="col-span-5">Description</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-right">Price</div>
                                <div className="col-span-2 text-right">Amount</div>
                                <div className="col-span-1 text-right">Status</div>
                            </div>
                            {invoice.items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 text-sm text-gray-600 items-center py-2">
                                    <div className="col-span-5">
                                        <p className="font-semibold text-gray-900">{item.description}</p>
                                        <p className="text-xs text-gray-500">{item.subtext}</p>
                                    </div>
                                    <div className="col-span-2 text-center  font-medium">{item.qty}</div>
                                    <div className="col-span-2 text-right">{item.price}</div>
                                    <div className="col-span-2 text-right text-gray-900 font-medium">{item.amount}</div>
                                    <div className="col-span-1 text-right">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="flex flex-col items-start justify-between w-full  mb-12">
                            <div className="w-full space-y-3">
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>{invoice.subtotal}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Tax (0%):</span>
                                    <span>{invoice.tax}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                                    <span>Total:</span>
                                    <span className=' text-teal-600 font-normal font-[poppins]'>{invoice.total}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200" />

                            </div>
                        </div>

                        {/* Footer / Notes */}
                        <div className="text-sm text-gray-600">
                            <h4 className="font-bold text-gray-900 mb-2">Notes:</h4>
                            <p className="leading-relaxed">{invoice.notes}</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>

    );
};

export default InvoiceModal;
