import React, { useEffect, useRef, useState } from 'react';
import ModalLayout from '../../modalLayout/ModalLayout';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Button from '../../../button/Button';
import { MdOutlineFileDownload } from 'react-icons/md';

interface Document {
    url: string;
    sharedRecords?: {
        id: string;
        clientId: string;
        eSignature?: string;
    }[];
}

interface ClientCompleteDocShareModalProps {
    completedDoc?: Document | undefined;
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

    useEffect(() => {
        const loadDocx = async () => {
            if (!completedDoc?.url) return;
            try {
                const response = await fetch(completedDoc.url);
                if (!response.ok) throw new Error(`Failed to fetch docx file: ${response.status}`);

                const arrayBuffer = await response.arrayBuffer();
                const { value } = await mammoth.convertToHtml({ arrayBuffer });
                setDocContent(value || '<p>No content found in document.</p>');
            } catch (err) {
                console.error('Error reading docx file:', err);
                setDocContent('<p style="color:red;">Unable to load document content.</p>');
            }
        };

        loadDocx();
    }, [completedDoc]);

    const filteredRecords =
        completedDoc?.sharedRecords?.filter((r) => r.clientId === clientId) || [];

    const handleDownloadPDF = async () => {

        if (!contentRef.current) return;

        const original = contentRef.current;
        const clone = original.cloneNode(true) as HTMLElement;

        // Style clone for accurate rendering
        clone.style.maxHeight = 'unset';
        clone.style.overflow = 'visible';
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.zIndex = '-9999';
        clone.style.width = `${original.offsetWidth}px`;

        document.body.appendChild(clone);

        const canvas = await html2canvas(clone, {
            useCORS: true,
            scale: 3, // higher scale = better quality
        });

        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Paginate content if needed
        while (heightLeft > 0) {
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;
            if (heightLeft > 0) {
                pdf.addPage();
                position -= pageHeight;
            }
        }

        pdf.save('document_with_esignatures.pdf');
        document.body.removeChild(clone);
    };


    return (
        <ModalLayout
            heading="Share the documents with clients"
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
                        {/* DOCX Content */}
                        <div>
                            <p className="font-semibold text-[14px] mb-2">Document Content:</p>
                            <div
                                className="prose max-w-none text-[14px]"
                                dangerouslySetInnerHTML={{ __html: docContent }}
                            />
                        </div>

                        {/* eSignatures */}
                        {filteredRecords.length > 0 && (
                            <div>
                                <p className="font-semibold text-[14px] mb-2">Esignatures:</p>
                                <div className="flex flex-wrap gap-4">
                                    {filteredRecords.map((record) =>
                                        record.eSignature ? (
                                            <img
                                                key={record.id}
                                                src={record.eSignature}
                                                alt="eSignature"
                                                crossOrigin="anonymous"
                                                className="w-[400px] h-[200px] border rounded shadow mt-4"
                                                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                                            />
                                        ) : (
                                            <p key={record.id} className="text-sm text-gray-500">
                                                No eSignature available
                                            </p>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            }
        />
    );
};

export default ClientCompleteDocShareModal;
