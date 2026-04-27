import React, { useEffect, useRef, useState } from 'react';
import ModalLayout from '../../modalLayout/ModalLayout';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Button from '../../../button/Button';
import { MdOutlineFileDownload } from 'react-icons/md';
import Checkbox from '../../../checkbox/Checkbox';
import { DocumentType } from '../../../../types/documentType/DocumentType';


// interface Document {
//     url: string;
//     sharedRecords?: {
//         id: string;
//         clientId: string;
//         eSignature?: string;
//     }[];
// }

interface SignedDocModalProps {
    completedDoc?: DocumentType | undefined;
    clientId?: string;
    showDownloadButton?: boolean
}

const SignedDocModal: React.FC<SignedDocModalProps> = ({
    completedDoc,
    clientId,
    showDownloadButton = false
}) => {
    const [docContent, setDocContent] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);
    console.log("COMPLETED DOCUMENT", completedDoc);

    // Support both direct and nested signature structures
    const rawRecords = (completedDoc as any)?.sharedWith || (completedDoc as any)?.sharedRecord || (completedDoc as any)?.sharedRecords || [];
    const filteredRecords = Array.isArray(rawRecords)
        ? rawRecords.filter((r: any) => !clientId || String(r?.clientId) === String(clientId))
        : [];

    const directSignature = (completedDoc as any)?.eSignature;
    const hasAnySignature = filteredRecords.some((r: any) => r.eSignature && r.eSignature !== "null") || (directSignature && directSignature !== "null");

    const [previewKind, setPreviewKind] = useState<'html' | 'pdf' | 'image' | undefined>(undefined);

    useEffect(() => {
        const loadDoc = async () => {
            if (!completedDoc?.document?.url) return;

            const fileUrl = completedDoc.document.url;
            const extension = fileUrl.split('.').pop()?.toLowerCase();

            if (extension === 'pdf') {
                setPreviewKind('pdf');
            } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
                setPreviewKind('image');
            } else if (['docx', 'doc'].includes(extension || '')) {
                try {
                    const response = await fetch(fileUrl, { credentials: 'include' });
                    if (!response.ok) throw new Error(`Failed to fetch docx file: ${response.status}`);
                    const arrayBuffer = await response.arrayBuffer();
                    const { value } = await mammoth.convertToHtml({ arrayBuffer });
                    setDocContent(value || '<p>No content found in document.</p>');
                    setPreviewKind('html');
                } catch (err) {
                    console.error('Error reading docx file:', err);
                    setDocContent('<p style="color:red;">Unable to load document content.</p>');
                    setPreviewKind('html');
                }
            } else {
                setPreviewKind('pdf'); // Fallback to Google Viewer
            }
        };

        loadDoc();
    }, [completedDoc]);


    const handleDownloadPDF = async () => {

        if (!contentRef.current) return;

        // 1. Temporary Monkey-patch for getContext to fix willReadFrequently warning
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        (HTMLCanvasElement.prototype as any).getContext = function (type: string, attributes: any) {
            if (type === '2d') {
                attributes = { ...attributes, willReadFrequently: true };
            }
            return originalGetContext.call(this, type, attributes);
        };

        const original = contentRef.current;
        const clone = original.cloneNode(true) as HTMLElement;

        // Manually copy canvas content from original to clone because cloneNode(true) doesn't copy canvas pixels
        const originalCanvases = original.querySelectorAll('canvas');
        const clonedCanvases = clone.querySelectorAll('canvas');
        clonedCanvases.forEach((clonedCanvas, index) => {
            const originalCanvas = originalCanvases[index] as HTMLCanvasElement;
            const destCanvas = clonedCanvas as HTMLCanvasElement;
            if (originalCanvas) {
                destCanvas.width = originalCanvas.width;
                destCanvas.height = originalCanvas.height;
                destCanvas.getContext('2d')?.drawImage(originalCanvas, 0, 0);
            }
        });

        // Style clone for accurate rendering
        clone.style.maxHeight = 'unset';
        clone.style.overflow = 'visible';
        clone.style.position = 'fixed'; // Use fixed to stay relative to viewport
        clone.style.top = '0';
        clone.style.left = '-10000px'; // Truly off-screen
        clone.style.zIndex = '-9999';
        clone.style.width = `${original.offsetWidth}px`;
        clone.style.background = '#ffffff';

        document.body.appendChild(clone);

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            if (previewKind === 'pdf') {
                // SCRIPTED EXPORT FOR PDF PREVIEWS
                const canvases = original.querySelectorAll('canvas');

                for (let i = 0; i < canvases.length; i++) {
                    const canvas = canvases[i] as HTMLCanvasElement;
                    const imgData = canvas.toDataURL('image/png');
                    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

                    if (i > 0) pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                }

                // Add Footer Section (Signatures)
                const footer = document.getElementById('footer-section');
                if (footer) {
                    const footerCanvas = await html2canvas(footer, {
                        useCORS: true,
                        scale: 2,
                        backgroundColor: '#ffffff',
                        onclone: (clonedDoc) => {
                            // Standard sanitization
                            const styleTags = clonedDoc.getElementsByTagName('style');
                            for (let i = 0; i < styleTags.length; i++) {
                                styleTags[i].innerHTML = styleTags[i].innerHTML.replace(/oklch\([^)]+\)/g, '#000000');
                            }
                        }
                    });
                    const footerImgData = footerCanvas.toDataURL('image/png');
                    const footerImgHeight = (footerCanvas.height * pdfWidth) / footerCanvas.width;

                    pdf.addPage();
                    pdf.addImage(footerImgData, 'PNG', 0, 0, pdfWidth, footerImgHeight);
                }
            } else {
                // WHOLE DOCUMENT EXPORT FOR DOCX/IMAGE
                const canvas = await html2canvas(clone, {
                    useCORS: true,
                    scale: 2,
                    backgroundColor: '#ffffff',
                    onclone: (clonedDoc) => {
                        // Aggressive sanitization
                        const styleTags = clonedDoc.getElementsByTagName('style');
                        for (let i = 0; i < styleTags.length; i++) {
                            styleTags[i].innerHTML = styleTags[i].innerHTML.replace(/oklch\([^)]+\)/g, '#000000');
                        }

                        const allElements = clonedDoc.getElementsByTagName('*');
                        for (let i = 0; i < allElements.length; i++) {
                            const el = allElements[i] as HTMLElement;
                            const computedStyle = window.getComputedStyle(el);
                            const colorProps = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke', 'boxShadow'];
                            colorProps.forEach(prop => {
                                const val = (computedStyle as any)[prop];
                                if (val && (val.includes('oklch') || val.includes('var('))) {
                                    if (prop === 'color') el.style.color = '#000000';
                                    else if (prop === 'backgroundColor') el.style.backgroundColor = 'transparent';
                                    else if (prop === 'borderColor') el.style.borderColor = '#e5e7eb';
                                    else if (prop === 'boxShadow') el.style.boxShadow = 'none';
                                    else el.style.setProperty(prop, 'initial', 'important');
                                }
                            });
                            const varsToRemove = ['--tw-ring-color', '--tw-ring-offset-color', '--tw-shadow-color', '--tw-outline-color'];
                            varsToRemove.forEach(v => el.style.removeProperty(v));
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/png');
                const imgHeight = (canvas.height * pdfWidth) / canvas.width;

                let heightLeft = imgHeight;
                let position = 0;

                while (heightLeft > 0) {
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pageHeight;
                    if (heightLeft > 0) {
                        pdf.addPage();
                        position -= pageHeight;
                    }
                }
            }

            pdf.save(`${completedDoc?.document?.name || 'document'}_signed.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
        } finally {
            // Restore original getContext and cleanup
            HTMLCanvasElement.prototype.getContext = originalGetContext;
            document.body.removeChild(clone);
        }
    };

    console.log("completedDoc?.eSignature", completedDoc?.eSignature);

    return (
        <ModalLayout
            heading="Signed Document"
            modalBodyContent={
                <div className="mt-4 ">
                    {showDownloadButton &&
                        <div className="text-right flex items-center justify-end">

                            <div className='w-[120px]'
                            >
                                <Button text='Download'
                                    sm onclick={handleDownloadPDF}
                                    icon={<MdOutlineFileDownload />} />
                            </div>
                        </div>
                    }

                    {/* Scrollable content in modal */}
                    <div
                        className="max-h-[500px] overflow-y-auto  rounded p-4 bg-white "
                        ref={contentRef}
                    >
                        {/* Document Content */}
                        <div>
                            <p className="font-semibold text-[14px] mb-2">Document Content:</p>
                            {previewKind === 'pdf' ? (
                                <div className="w-full flex flex-col gap-2">
                                    <iframe
                                        src={completedDoc?.document?.url}
                                        title="PDF Document Preview"
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50"
                                        style={{ height: '55vh', minHeight: '380px' }}
                                    />
                                    <div className="flex justify-end gap-3">
                                        <a
                                            href={completedDoc?.document?.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-primaryColorDark underline hover:text-[#0B786B] transition-colors"
                                        >
                                            Open in new tab ↗
                                        </a>
                                        <a
                                            href={completedDoc?.document?.url}
                                            download
                                            className="text-sm font-medium text-primaryColorDark underline hover:text-[#0B786B] transition-colors"
                                        >
                                            Download PDF ⬇
                                        </a>
                                    </div>
                                </div>
                            ) : previewKind === 'image' ? (
                                <div className="flex justify-center border rounded p-2">
                                    <img
                                        src={completedDoc?.document?.url}
                                        alt="Document"
                                        className="max-w-full h-auto object-contain"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="prose max-w-none text-[14px]"
                                    dangerouslySetInnerHTML={{ __html: docContent }}
                                />
                            )}
                        </div>

                        <div id="footer-section">
                            {/* Agreed checkbox */}
                            <div className='mt-4 mb-4'>
                                <div className='flex items-center gap-x-2.5'>
                                    <Checkbox
                                        text="I agree to the terms and condition mentioned above."
                                        checked={completedDoc?.isAgree}
                                    />
                                </div>
                            </div>

                            {/* Deduplicated e-signatures */}
                            {(() => {
                                const allSigs: { url: string; label?: string }[] = [];
                                const seenUrls = new Set<string>();

                                filteredRecords.forEach((record: any) => {
                                    const sig = record?.eSignature;
                                    if (sig && sig !== "null" && !seenUrls.has(sig)) {
                                        seenUrls.add(sig);
                                        allSigs.push({ url: sig, label: record?.client?.user?.fullName || record?.clientName || undefined });
                                    }
                                });

                                if (directSignature && directSignature !== "null" && !seenUrls.has(directSignature)) {
                                    seenUrls.add(directSignature);
                                    allSigs.push({ url: directSignature });
                                }

                                if (allSigs.length === 0) {
                                    return (
                                        <div className="mt-6 flex items-center gap-2 text-gray-400 text-sm italic border-t pt-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                            This document has not been signed yet.
                                        </div>
                                    );
                                }

                                return (
                                    <div className="mt-6 border-t border-dashed border-gray-300 pt-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                                <span className="font-semibold text-[14px]">Digitally Signed</span>
                                            </div>
                                        </div>

                                        <p className="font-semibold text-[14px] text-gray-700 mb-3">
                                            E-Signature{allSigs.length > 1 ? 's' : ''} ({allSigs.length}):
                                        </p>

                                        <div className="flex flex-wrap gap-6">
                                            {allSigs.map((sig, idx) => (
                                                <div key={idx} className="flex flex-col items-center gap-1">
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white shadow-sm">
                                                        <img
                                                            src={sig.url}
                                                            alt={`eSignature${sig.label ? ` - ${sig.label}` : ''}`}
                                                            crossOrigin="use-credentials"
                                                            className="w-[300px] h-[120px] object-contain"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                    {sig.label && (
                                                        <p className="text-xs text-gray-500 font-medium">{sig.label}</p>
                                                    )}
                                                    <p className="text-xs text-gray-400">Signature {idx + 1}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                    </div>
                </div>
            }
        />
    );
};

export default SignedDocModal;
