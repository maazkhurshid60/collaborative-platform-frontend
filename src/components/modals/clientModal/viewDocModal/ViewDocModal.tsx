// import ModalLayout from '../../modalLayout/ModalLayout'
// import Button from '../../../button/Button'
// import { useState } from 'react';
// import { toast } from 'react-toastify';
// import {
//     isModalShowReducser,
//     //  isshowSignedDocumentModalClientPortalReducer 
// } from '../../../../redux/slices/ModalSlice';

// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '../../../../redux/store';
// // import UploadFile from '../../../inputField/UploadFile';
// import Checkbox from '../../../checkbox/Checkbox';
// import { documentSignByClientType } from '../../../../types/documentType/DocumentType';
// import documentApiService from '../../../../apiServices/documentApi/DocumentApi';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { AxiosError } from 'axios';
// // import CrossIcon from '../../../icons/cross/Cross';
// // import { baseUrl } from '../../../../apiServices/baseUrl/BaseUrl';
// import { useNavigate } from 'react-router-dom';
// import Loader from '../../../loader/Loader';

// interface ViewDocModalProps {
//     sharedDocs?: string
//     data: documentSignByClientType
//     isOnlyRead?: boolean
// }


// const ModalBodyContent: React.FC<{ docs: string, data: documentSignByClientType, isOnlyRead: boolean }> = ({ docs, data, isOnlyRead }) => {
//     const [isAgree, setIsAgree] = useState(false);
//     const dispatch = useDispatch<AppDispatch>()
//     const [isLoading, setIsLoading] = useState(false); // Define loading state

//     // const [signAdd, setSignAdd] = useState<string | null>(null);
//     // const [signatureFile, setSignatureFile] = useState<File | null>(null);
//     const queryClient = useQueryClient();
//     const senderId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)
//     const isESignature = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.eSignature)
//     const navigate = useNavigate()

//     console.log("isESignature", isESignature);

//     // --- useMutation hook ---
//     const mutation = useMutation({
//         mutationFn: async (formData: {
//             isAgree: boolean;
//             eSignature: string;
//             clientId?: string;
//             sharedDocumentId?: string;
//             senderId?: string;
//         }) => {
//             return documentApiService.documentSignByClientApi(formData);

//         },
//         onSuccess: () => {
//             toast.success("Document signed successfully!");
//             queryClient.invalidateQueries({ queryKey: ['documents'] }); // Adjust key to match your app
//             setIsLoading(false);
//             dispatch(isModalShowReducser(false));
//         },
//         onError: (err: unknown) => {
//             const axiosError = err as AxiosError<{ error: string }>;
//             setIsLoading(false);
//             const errorMessage = axiosError.response?.data?.error || "Something went wrong";
//             toast.error(errorMessage);
//         }
//     });
//     const submitFunction = async () => {
//         if (!isAgree) {
//             toast.error("Please agree to the terms and conditions.");
//             return;
//         }
//         if (!isESignature || isESignature === "null" || isESignature === null) {
//             toast.error("Please upload your signature.");
//             return;
//         }

//         const formData = {
//             isAgree: isAgree,
//             eSignature: isESignature,
//             clientId: data?.clientId,
//             sharedDocumentId: data?.documentId,
//             senderId: senderId
//         }
//         setIsLoading(true);
//         mutation.mutate(formData);
//     };
//     // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     //     const file = e.target.files?.[0];
//     //     if (file) {
//     //         const imageUrl = URL.createObjectURL(file);
//     //         setSignAdd(imageUrl); // for preview
//     //         setSignatureFile(file); // for uploading
//     //     }
//     // };
//     console.log("isESignature", isESignature === "null");

//     return (
//         <>
//             {isLoading && <Loader />}
//             <div className='mt-4'>
//                 <div className='h-[300px]  overflow-auto'>

//                     <div className="p-4 text-textColor" dangerouslySetInnerHTML={{ __html: docs }} />

//                 </div>
//                 {!isOnlyRead &&
//                     <>
//                         <div className='mt-4 mb-4'>
//                             <div className='flex items-center gap-x-2.5'>

//                                 <Checkbox
//                                     text="I agree to the terms and condition mentioned above."
//                                     onChange={() => setIsAgree(!isAgree)}
//                                     checked={isAgree}
//                                 />
//                             </div>


//                         </div>
//                         {/* {signAdd ? <div className='relative'> <img
//                         src={signAdd}
//                         alt="Signature"
//                         className="m-auto min-h-[120px] max-h-[120px] object-contain rounded-md mb-4"
//                     />
//                         <CrossIcon onClick={() => setSignAdd(null)} />
//                     </div> :
//                         <UploadFile onChange={handleFileChange} text='Add your signature here' heading='Sign here' />

//                     } */}

//                         {isESignature !== null && isESignature !== "null" ?
//                             <div className='relative'> <img
//                                 src={isESignature}
//                                 alt="Signature"
//                                 className="m-auto min-h-[120px] max-h-[120px] object-contain rounded-md mb-4"
//                             />
//                             </div>
//                             : <p className='text-red-600 mb-4'>First Upload E-Signature on Your Account. To Upload please Click <span className='cursor-pointer font-bold'
//                                 onClick={() => {
//                                     dispatch(isModalShowReducser(false));
//                                     navigate(`/settings`);
//                                 }
//                                 }>
//                                 Here</span> </p>
//                         }

//                         <Button text='Submit' sm onclick={submitFunction} />
//                     </>
//                 }
//             </div >
//         </>

//     );
// };

// const ViewDocModal: React.FC<ViewDocModalProps> = ({ sharedDocs, data, isOnlyRead = false }) => {
//     return (
//         <>

//             <ModalLayout
//                 heading='Privacy Policy Consent'
//                 modalBodyContent={<ModalBodyContent docs={sharedDocs ?? ""} data={data} isOnlyRead={isOnlyRead} />}
//             />
//         </>
//     );
// };

// export default ViewDocModal;


import ModalLayout from "../../modalLayout/ModalLayout";
import Button from "../../../button/Button";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { isModalShowReducser } from "../../../../redux/slices/ModalSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store";
import Checkbox from "../../../checkbox/Checkbox";
import { documentSignByClientType } from "../../../../types/documentType/DocumentType";
import documentApiService from "../../../../apiServices/documentApi/DocumentApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../../../loader/Loader";
import PdfViewer from "../../../pdfViewer/PdfViewer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { MdOutlineFileDownload } from "react-icons/md";

type PreviewKind = "html" | "pdf" | "image";

interface ViewDocModalProps {
  sharedDocs?: string; // HTML for docx/others
  data: documentSignByClientType;
  isOnlyRead?: boolean;

  // NEW
  previewKind?: PreviewKind;
  pdfUrl?: string;
  heading?: string;
}

const ModalBodyContent: React.FC<{
  docs: string;
  data: documentSignByClientType;
  isOnlyRead: boolean;
  previewKind: PreviewKind;
  pdfUrl?: string;
  heading?: string;
}> = ({ docs, data, isOnlyRead, previewKind, pdfUrl, heading }) => {
  const [isAgree, setIsAgree] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();
  const senderId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id);
  const isESignature = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.eSignature);
  const navigate = useNavigate();

  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    // Temporary monkeypatch to prevent console noise
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    (HTMLCanvasElement.prototype as any).getContext = function (type: string, attributes: any) {
      if (type === '2d') {
        attributes = { ...attributes, willReadFrequently: true };
      }
      return originalGetContext.call(this, type, attributes);
    };

    const original = contentRef.current;
    const clone = original.cloneNode(true) as HTMLElement;

    // style clone for perfect sizing in PDF
    // style clone for perfect sizing in PDF
    clone.id = 'view-doc-clone';
    clone.style.maxHeight = 'unset';
    clone.style.overflow = 'visible';
    clone.style.position = 'fixed';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.opacity = '0';
    clone.style.zIndex = '-9999';
    clone.style.width = '800px';
    clone.style.background = '#ffffff';
    clone.style.padding = '40px';

    document.body.appendChild(clone);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const canvas = await html2canvas(clone, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('view-doc-clone');
          if (clonedElement) {
            clonedElement.style.opacity = '1';
          }

          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            styleTags[i].innerHTML = styleTags[i].innerHTML.replace(/oklch\([^)]+\)/g, '#000000');
          }
        }
      });

      if (canvas.width > 0 && canvas.height > 0) {
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

      pdf.save(`${heading || 'completed_form'}_signed.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      toast.error("Failed to generate PDF download.");
    } finally {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
      document.body.removeChild(clone);
    }
  };

  const handleDownloadPDFUrl = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      const fileName = heading ? `${heading}_signed.pdf` : "completed_form_signed.pdf";
      anchor.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Direct PDF download failed, falling back to opening in a new tab:", err);
      window.open(url, "_blank");
    }
  };

  const mutation = useMutation({
    mutationFn: async (formData: {
      isAgree: boolean;
      eSignature: string;
      clientId?: string;
      sharedDocumentId?: string;
      senderId?: string;
    }) => {
      return documentApiService.documentSignByClientApi(formData);
    },
    onSuccess: () => {
      toast.success("Document signed successfully!");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setIsLoading(false);
      dispatch(isModalShowReducser(false));
    },
    onError: (err: unknown) => {
      const axiosError = err as AxiosError<{ error: string }>;
      setIsLoading(false);
      const errorMessage = axiosError.response?.data?.error || "Something went wrong";
      toast.error(errorMessage);
    },
  });

  const submitFunction = async () => {
    if (!isAgree) {
      toast.error("Please agree to the terms and conditions.");
      return;
    }
    if (!isESignature || isESignature === "null") {
      toast.error("Please upload your signature.");
      return;
    }

    const formData = {
      isAgree,
      eSignature: isESignature,
      clientId: data?.clientId,
      sharedDocumentId: data?.documentId,
      senderId,
    };

    setIsLoading(true);
    mutation.mutate(formData);
  };

  return (
    <>
      {isLoading && <Loader />}

      <div className="mt-4">
        {/* DOWNLOAD BUTTON FOR HTML CONTENT (COMPLETED FORMS) */}
        {isOnlyRead && previewKind === "html" && (
          <div className="text-right flex items-center justify-end mb-3">
            <div className="w-[120px]">
              <Button
                text="Download"
                sm
                onclick={handleDownloadPDF}
                icon={<MdOutlineFileDownload />}
              />
            </div>
          </div>
        )}

        {/* CONTENT AREA */}
        {previewKind === "pdf" && pdfUrl ? (
          <div className="flex flex-col gap-2">
            {/* Native iframe — browser streams PDF directly from S3, no JS memory overhead */}
            <iframe
              src={pdfUrl}
              title="PDF Document Preview"
              className="w-full rounded-xl border border-gray-200 shadow-sm bg-gray-50"
              style={{ height: "60vh", minHeight: "400px" }}
            />
            {/* Fallback for browsers that block inline PDF */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primaryColorDark underline hover:text-[#0B786B] transition-colors"
              >
                Open in new tab ↗
              </a>
              <button
                onClick={() => handleDownloadPDFUrl(pdfUrl)}
                className="text-sm font-medium text-primaryColorDark underline hover:text-[#0B786B] transition-colors bg-transparent border-none p-0 cursor-pointer"
              >
                Download PDF ⬇
              </button>
            </div>
          </div>
        ) : previewKind === "image" && pdfUrl ? (
          <div className="max-h-[500px] overflow-auto flex justify-center border rounded p-2">
            <img src={pdfUrl} alt="Document Preview" className="max-w-full h-auto object-contain" />
          </div>
        ) : (
          <div className="max-h-[480px] overflow-auto border rounded bg-white shadow-inner" ref={contentRef}>
            <div className="p-6 text-textColor prose max-w-none" dangerouslySetInnerHTML={{ __html: docs }} />
          </div>
        )}

        {/* SIGNING AREA */}
        {!isOnlyRead && (
          <>
            <div className="mt-4 mb-4 ">
              <div className="flex items-center gap-x-2.5">
                <Checkbox
                  text="I agree to the terms and condition mentioned above."
                  onChange={() => setIsAgree(!isAgree)}
                  checked={isAgree}
                />
              </div>
            </div>

            {isESignature !== null && isESignature !== "null" ? (
              <div className="relative">
                <img
                  src={isESignature}
                  alt="Signature"
                  className="m-auto min-h-[120px] max-h-[120px] object-contain rounded-md mb-4"
                />
              </div>
            ) : (
              <p className="text-red-600 mb-4">
                First Upload E-Signature on Your Account. To Upload please Click
                <span
                  className="cursor-pointer font-bold"
                  onClick={() => {
                    dispatch(isModalShowReducser(false));
                    navigate(`/settings`);
                  }}
                >
                  Here
                </span>
              </p>
            )}

            <Button text="Submit" sm onclick={submitFunction} />
          </>
        )}
      </div>
    </>
  );
};

const ViewDocModal: React.FC<ViewDocModalProps> = ({
  sharedDocs,
  data,
  isOnlyRead = false,
  previewKind = "html",
  pdfUrl,
  heading = "Privacy Policy Consent",
}) => {
  return (
    <ModalLayout
      heading={heading}
      modalBodyContent={
        <ModalBodyContent
          docs={sharedDocs ?? ""}
          data={data}
          isOnlyRead={isOnlyRead}
          previewKind={previewKind}
          pdfUrl={pdfUrl}
          heading={heading}
        />
      }
    />
  );
};

export default ViewDocModal;
