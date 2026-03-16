import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates a styled invoice HTML string and downloads it as a PDF
 * without opening any modal. Uses the same structure as InvoiceModal.
 */
export async function downloadInvoicePdf(invoiceData: {
    invoiceNo: string;
    date: string;
    dueDate: string;
    billTo: { name: string; email: string; address: string; city: string };
    items: { description: string; subtext: string; qty: string; price: string; amount: string; status: string }[];
    subtotal: string;
    tax: string;
    total: string;
    notes: string;
}): Promise<void> {
    // 1. Create an off-screen container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '595px'; // A4 width in px at 72dpi
    container.style.backgroundColor = '#ffffff';
    container.style.fontFamily = 'Poppins, sans-serif';
    container.style.padding = '32px';
    container.style.boxSizing = 'border-box';
    document.body.appendChild(container);

    // 2. Build invoice HTML (mirrors InvoiceModal layout)
    const statusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'paid') return { bg: '#dcfce7', color: '#15803d' };
        if (s === 'pending') return { bg: '#fef9c3', color: '#a16207' };
        return { bg: '#fee2e2', color: '#b91c1c' };
    };

    const itemRows = invoiceData.items.map(item => {
        const sc = statusColor(item.status);
        return `
            <tr style="font-size:11px; color:#4b5563;  solid #f3f4f6;">
                <td style="padding:12px 6px; width:40%;">
                    <p style="font-weight:600; color:#111827; margin:0 0 4px 0;">${item.description}</p>
                    <p style="font-size:9px; color:#6b7280; margin:0; line-height:1.4;">${item.subtext}</p>
                </td>
                <td style="padding:12px 6px; text-align:center; font-weight:500;">${item.qty}</td>
                <td style="padding:12px 6px; text-align:center;">${item.price}</td>
                <td style="padding:12px 6px; text-align:center; font-weight:600; color:#111827;">${item.amount}</td>
                <td style="padding:12px 6px; text-align:center;">
                    <span style="color:${sc.color}; padding:4px 8px; font-size:9px; font-weight:600; display:inline-block;">${item.status}</span>
                </td>
            </tr>`;
    }).join('');

    container.innerHTML = `
        <div style="background:#fff; font-family:'Poppins',sans-serif; font-size:12px; color:#374151;">
            <!-- Header -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;">
                <div>
                    <img src="/assets/logo.png" alt="KolabMe" style="height:60px; width:auto; object-fit:contain; margin-bottom:4px;" />
                    <p style="font-size:10px; color:#6b7280; margin:2px 0;">123 Business Street</p>
                    <p style="font-size:10px; color:#6b7280; margin:2px 0;">San Francisco, CA 94102</p>
                    <p style="font-size:10px; color:#6b7280; margin:2px 0;">katelin@kolabme.com/p>
                </div>
                <div style="text-align:right;">
                    <p style="font-size:22px; font-weight:700; color:#111827; margin:0 0 8px;">INVOICE</p>
                    <p style="font-size:10px; color:#4b5563; margin:2px 0;"><span style="color:#6b7280; font-weight:500;">Invoice #:</span> ${invoiceData.invoiceNo}</p>
                    <p style="font-size:10px; color:#4b5563; margin:2px 0;"><span style="color:#6b7280; font-weight:500;">Date:</span> ${invoiceData.date}</p>
                    <p style="font-size:10px; color:#4b5563; margin:2px 0;"><span style="color:#6b7280; font-weight:500;">Due Date:</span> ${invoiceData.dueDate}</p>
                </div>
            </div>


            <!-- Bill To -->
            <div style="margin-bottom:20px;">
                <p style="font-size:12px; font-weight:700; color:#111827; margin:0 0 6px;">Bill To:</p>
                <p style="font-size:11px; font-weight:600; color:#111827; margin:2px 0;">${invoiceData.billTo.name}</p>
                <p style="font-size:11px; color:#4b5563; margin:2px 0;">${invoiceData.billTo.email} </p>
                <p style="font-size:11px; color:#4b5563; margin:2px 0;">${invoiceData.billTo.address}${invoiceData.billTo.city ? ', ' + invoiceData.billTo.city : ''}</p>
            </div>

            <!-- Items Table -->
            <div style="background:#f9fafb; border-radius:8px; padding:16px; margin-bottom:20px;">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="font-size:10px; font-weight:700; color:#111827; border-bottom:2px solid #e5e7eb;">
                            <th style="padding:12px 6px; text-align:left; width:40%;">Description</th>
                            <th style="padding:12px 6px; text-align:center;">Qty</th>
                            <th style="padding:12px 6px; text-align:center;">Price</th>
                            <th style="padding:12px 6px; text-align:center;">Amount</th>
                            <th style="padding:12px 6px; text-align:center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>
            </div>

            <!-- Totals -->
            <div style="margin-bottom:20px;">
                <div style="display:flex; justify-content:space-between; font-size:10px; color:#4b5563; margin:4px 0;">
                    <span>Subtotal:</span><span>${invoiceData.subtotal}</span>
                </div>
                <hr style="border:none; border-top:1px solid #e5e7eb; margin:8px 0;" />
                <div style="display:flex; justify-content:space-between; font-size:14px;  margin:4px 0;">
                    <span style="color:#111827; font-weight:700;">Total:</span>
                    <span style="color:#0d9488;">${invoiceData.total}</span>
                </div>
            </div>

            <!-- Notes -->
            <div style="font-size:10px; color:#4b5563;">
                <p style="font-weight:700; color:#111827; margin:0 0 4px;">Notes:</p>
                <p style="margin:0; line-height:1.5;">${invoiceData.notes}</p>
            </div>
        </div>
    `;

    // 3. Wait for images (logo) to fully load before capturing
    await new Promise<void>((resolve) => {
        const images = container.querySelectorAll('img');
        if (images.length === 0) { resolve(); return; }
        let loaded = 0;
        images.forEach(img => {
            if (img.complete) { loaded++; if (loaded === images.length) resolve(); }
            else {
                img.onload = () => { loaded++; if (loaded === images.length) resolve(); };
                img.onerror = () => { loaded++; if (loaded === images.length) resolve(); };
            }
        });
    });

    // 4. Capture and generate PDF
    try {
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`invoice-${invoiceData.invoiceNo}.pdf`);
    } finally {
        // 4. Always clean up the off-screen element
        document.body.removeChild(container);
    }
}



// <div style="display:flex; justify-content:space-between; font-size:10px; color:#4b5563; margin:4px 0;">
//                     <span>Tax (0%):</span><span>${invoiceData.tax}</span>
//                 </div>