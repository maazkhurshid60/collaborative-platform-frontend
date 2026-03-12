import React, { useEffect, useRef, useState } from 'react';
import ModalLayout from '../../modalLayout/ModalLayout';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Button from '../../../button/Button';
import { MdOutlineFileDownload } from 'react-icons/md';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Loader from '../../../loader/Loader';

// Set up worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
    const [numPages, setNumPages] = useState<number>(0);
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
                            <div className="w-full border rounded overflow-hidden p-2 bg-gray-100 flex flex-col items-center gap-y-4">
                                <Document
                                    file={completedDoc.url}
                                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                    loading={<Loader text="Loading PDF..." />}
                                    error={<p className="text-red-500">Failed to load PDF.</p>}
                                >
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <div key={`page_${index + 1}`} className="shadow-md">
                                            <Page
                                                pageNumber={index + 1}
                                                width={contentRef.current ? contentRef.current.offsetWidth - 40 : 500}
                                                renderAnnotationLayer={false}
                                                renderTextLayer={false}
                                            />
                                        </div>
                                    ))}
                                </Document>
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
                            {/* eSignatures */}
                            {(filteredRecords.length > 0 || directSignature) && (
                                <div className='mt-8'>
                                    <p className="font-semibold text-[14px] mb-2">Esignatures:</p>
                                    <div className="flex flex-wrap gap-4">
                                        {directSignature && (
                                            <img
                                                src={directSignature}
                                                alt="eSignature"
                                                crossOrigin="use-credentials"
                                                className="w-[400px] h-[200px] border rounded shadow mt-4"
                                                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                                            />
                                        )}
                                        {filteredRecords.map((record: any) =>
                                            record.eSignature ? (
                                                <img
                                                    key={record.id}
                                                    src={record.eSignature}
                                                    alt="eSignature"
                                                    crossOrigin="use-credentials"
                                                    className="w-[400px] h-[200px] border rounded shadow mt-4"
                                                    onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                                                />
                                            ) : null
                                        )}
                                    </div>
                                </div>
                            )}
                            {filteredRecords.length === 0 && !directSignature && (
                                <p className="text-sm text-gray-500 mt-4 italic">No signatures found for this client on this document.</p>
                            )}
                        </div>
                    </div>
                </div>
            }
        />
    );
};

export default ClientCompleteDocShareModal;
