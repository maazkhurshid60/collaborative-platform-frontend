import React, { useEffect, useRef, useState } from 'react';
import ModalLayout from '../../modalLayout/ModalLayout';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Button from '../../../button/Button';
import { MdOutlineFileDownload } from 'react-icons/md';
import Checkbox from '../../../checkbox/Checkbox';
import { DocumentType } from '../../../../types/documentType/DocumentType';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Loader from '../../../loader/Loader';

// Set up worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
    const [numPages, setNumPages] = useState<number>(0);
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
                                <div className="w-full border rounded overflow-hidden p-2 bg-gray-100 flex flex-col items-center gap-y-4">
                                    <Document
                                        file={completedDoc?.document?.url}
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
                            <div className='mt-4 mb-4'>
                                <div className='flex items-center gap-x-2.5'>

                                    <Checkbox
                                        text="I agree to the terms and condition mentioned above."
                                        // onChange={() => setIsAgree(!isAgree)}
                                        checked={completedDoc?.isAgree}
                                    />
                                </div>
                            </div>

                            {/* eSignatures */}
                            {hasAnySignature && (
                                <div>
                                    <p className="font-semibold text-[14px] mb-2">ESignatures:</p>
                                    <div className="flex flex-wrap gap-4">
                                        {/* Render nested records */}
                                        {filteredRecords.map((record: any) => (
                                            record.eSignature && record.eSignature !== "null" && (
                                                <img
                                                    key={record.id}
                                                    src={record.eSignature}
                                                    alt="eSignature"
                                                    crossOrigin="use-credentials"
                                                    className="w-[400px] h-[200px] border rounded shadow mt-4 object-contain"
                                                    onError={(e) => {
                                                        console.error("Signature load error for nested record:", record.id);
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            )
                                        ))}

                                        {/* Render direct signature if not already shown in filteredRecords */}
                                        {directSignature && directSignature !== "null" && !filteredRecords.some((r: any) => r.eSignature === directSignature) && (
                                            <img
                                                src={directSignature}
                                                alt="eSignature"
                                                crossOrigin="use-credentials"
                                                className="w-[400px] h-[200px] border rounded shadow mt-4 object-contain"
                                                onError={(e) => {
                                                    console.error("Signature load error for directSignature");
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            }
        />
    );
};

export default SignedDocModal;
