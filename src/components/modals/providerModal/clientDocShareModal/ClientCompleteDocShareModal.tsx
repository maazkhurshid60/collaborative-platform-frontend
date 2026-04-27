import React, { useEffect, useRef, useState } from 'react';
import ModalLayout from '../../modalLayout/ModalLayout';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Button from '../../../button/Button';
import { MdOutlineFileDownload } from 'react-icons/md';


interface DocumentData {
    url: string;
    name?: string;
    sharedRecord?: {
        id: string;
        clientId: string;
        eSignature?: string;
    }[];
}

interface ClientCompleteDocShareModalProps {
    completedDoc?: DocumentData | undefined;
    clientId?: string;
    showDownloadButton?: boolean
}

const ClientCompleteDocShareModal: React.FC<ClientCompleteDocShareModalProps> = ({
    completedDoc,
    clientId,
    showDownloadButton = false
}) => {
    const [docContent, setDocContent] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);

    const [previewKind, setPreviewKind] = useState<'pdf' | 'image' | 'docx'>('docx');

    useEffect(() => {
        const loadDoc = async () => {
            if (!completedDoc?.url) return;
            const url = completedDoc.url;
            const extension = url.split('.').pop()?.toLowerCase();

            if (extension === 'pdf') {
                setPreviewKind('pdf');
            } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
                setPreviewKind('image');
            } else if (['docx', 'doc'].includes(extension || '')) {
                setPreviewKind('docx');
                try {
                    const response = await fetch(url, {
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

                    const arrayBuffer = await response.arrayBuffer();
                    const { value } = await mammoth.convertToHtml({ arrayBuffer });
                    setDocContent(value || '<p>No content found in document.</p>');
                } catch (err) {
                    console.error('Error reading docx file:', err);
                    setDocContent('<p style="color:red;">Unable to load document content.</p>');
                }
            } else {
                setPreviewKind('pdf');
            }
        };

        loadDoc();
    }, [completedDoc]);

    // Robust signature extraction
    const rawRecords = (completedDoc as any)?.sharedWith || (completedDoc as any)?.sharedRecord || (completedDoc as any)?.sharedRecords || [];
    const filteredRecords = Array.isArray(rawRecords)
        ? rawRecords.filter((r: any) => !clientId || String(r?.clientId) === String(clientId))
        : [];

    // Support for direct eSignature if nested structure is missing
    const directSignature = (completedDoc as any)?.eSignature;

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
        clone.style.position = 'fixed';
        clone.style.top = '0';
        clone.style.left = '-10000px';
        clone.style.zIndex = '-9999';
        clone.style.width = `${original.offsetWidth}px`;
        clone.style.background = '#ffffff';

        document.body.appendChild(clone);

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const sanitizeClonedDoc = (clonedDoc: Document) => {
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
                    const varsToRemove = [
                        '--tw-ring-color', '--tw-ring-offset-color',
                        '--tw-shadow-color', '--tw-outline-color',
                        '--tw-border-opacity', '--tw-text-opacity', '--tw-bg-opacity'
                    ];
                    varsToRemove.forEach(v => el.style.removeProperty(v));
                }
            };

            if (previewKind === 'pdf') {
                const canvases = original.querySelectorAll('canvas');

                for (let i = 0; i < canvases.length; i++) {
                    const canvas = canvases[i] as HTMLCanvasElement;
                    if (canvas.width === 0 || canvas.height === 0) continue;

                    const imgData = canvas.toDataURL('image/png');
                    if (imgData.length < 50) continue; // Skip suspicious tiny stubs

                    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

                    if (i > 0) pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                }

                // Add Footer Section (Signatures) - Get from original if visible or clone if not
                const footer = document.getElementById('provider-footer-section');
                if (footer && footer.offsetHeight > 0) {
                    const footerCanvas = await html2canvas(footer, {
                        useCORS: true,
                        scale: 2,
                        backgroundColor: '#ffffff',
                        onclone: (clonedDoc) => sanitizeClonedDoc(clonedDoc)
                    });

                    const footerImgData = footerCanvas.toDataURL('image/png');
                    if (footerImgData.length > 100) {
                        const footerImgHeight = (footerCanvas.height * pdfWidth) / footerCanvas.width;
                        pdf.addPage();
                        pdf.addImage(footerImgData, 'PNG', 0, 0, pdfWidth, footerImgHeight);
                    }
                }
            } else {
                const canvas = await html2canvas(clone, {
                    useCORS: true,
                    scale: 2,
                    backgroundColor: '#ffffff',
                    onclone: (clonedDoc) => sanitizeClonedDoc(clonedDoc)
                });

                if (canvas.width > 0 && canvas.height > 0) {
                    const imgData = canvas.toDataURL('image/png');
                    if (imgData.length > 100) {
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
                }
            }

            pdf.save(`${completedDoc?.name || 'document'}_signed.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
        } finally {
            HTMLCanvasElement.prototype.getContext = originalGetContext;
            document.body.removeChild(clone);
        }
    };


    return (
        <ModalLayout
            heading="Share the documents with clients"
            modalBodyContent={
                <div className="mt-10 ">
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
                        className="max-h-[500px] overflow-y-auto rounded p-2 bg-white"
                        ref={contentRef}
                    >
                        {/* CONTENT AREA */}
                        <p className="font-semibold text-[14px] mb-2">Document Content:</p>
                        {previewKind === "pdf" && completedDoc?.url ? (
                            <div className="w-full flex flex-col gap-2">
                                <iframe
                                    src={completedDoc.url}
                                    title="PDF Document Preview"
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50"
                                    style={{ height: "55vh", minHeight: "380px" }}
                                />
                                <div className="flex justify-end gap-3">
                                    <a
                                        href={completedDoc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-primaryColorDark underline hover:text-[#0B786B] transition-colors"
                                    >
                                        Open in new tab ↗
                                    </a>
                                    <a
                                        href={completedDoc.url}
                                        download
                                        className="text-sm font-medium text-primaryColorDark underline hover:text-[#0B786B] transition-colors"
                                    >
                                        Download PDF ⬇
                                    </a>
                                </div>
                            </div>
                        ) : previewKind === "image" && completedDoc?.url ? (
                            <div className="flex justify-center border rounded p-2">
                                <img src={completedDoc.url} alt="Document Preview" className="max-w-full h-auto object-contain" crossOrigin="anonymous" />
                            </div>
                        ) : (
                            <div
                                className="prose max-w-none text-[14px] p-2"
                                dangerouslySetInnerHTML={{ __html: docContent }}
                            />
                        )}

                        <div id="provider-footer-section">
                            {/* Build a deduplicated list of signatures */}
                            {(() => {
                                // Collect all signatures: from nested records + directSignature
                                const allSigs: { url: string; label?: string }[] = [];
                                const seenUrls = new Set<string>();

                                // From nested sharedWith/sharedRecord records
                                filteredRecords.forEach((record: any) => {
                                    const sig = record?.eSignature;
                                    if (sig && sig !== "null" && !seenUrls.has(sig)) {
                                        seenUrls.add(sig);
                                        allSigs.push({ url: sig, label: record?.client?.user?.fullName || record?.clientName || undefined });
                                    }
                                });

                                // From direct eSignature (only if not already shown above)
                                if (directSignature && directSignature !== "null" && !seenUrls.has(directSignature)) {
                                    seenUrls.add(directSignature);
                                    allSigs.push({ url: directSignature });
                                }

                                if (allSigs.length === 0) {
                                    return (
                                        <div className="mt-6 flex items-center gap-2 text-gray-400 text-sm italic border-t pt-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                            This document has not been signed yet.
                                        </div>
                                    );
                                }

                                return (
                                    <div className="mt-8 border-t border-dashed border-gray-300 pt-6">
                                        {/* Signed badge */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
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
                            {filteredRecords.length === 0 && !directSignature && (
                                <p className="text-sm text-gray-500 mt-4 italic">No signatures found for this client on this document.</p>
                            )}
                        </div>
                    </div>
                </div >
            }
        />
    );
};

export default ClientCompleteDocShareModal;
