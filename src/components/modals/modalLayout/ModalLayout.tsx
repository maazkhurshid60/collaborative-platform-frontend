
// import { RxCross2 } from "react-icons/rx";
// import { useDispatch } from 'react-redux';
// import { AppDispatch } from '../../../redux/store';
// import { isAddDocumentModalReducer, isClientCompleteDocModalReducer, isClientShareDocModalReducer, isDeleteChannelModalShowReducer, isModalDeleteReducer, isModalShowReducser, isModalShowRejectReducer, isNewChatModalShowReducser, isNewGroupChatModalShowReducser, isshowSignedDocumentModalClientPortalReducer } from '../../../redux/slices/ModalSlice';
// import ToolTip from "../../toolTip/ToolTip";
// interface ModalLayout {
//     modalBodyContent: React.ReactNode
//     heading: string
//     onClose?: () => void;
// }
// const ModalLayout: React.FC<ModalLayout> = (props) => {
//     const dispatch = useDispatch<AppDispatch>()

//     const closeModalFun = () => {
//         dispatch(isModalShowReducser(false));
//         dispatch(isModalDeleteReducer(false));
//         dispatch(isNewChatModalShowReducser(false));
//         dispatch(isNewGroupChatModalShowReducser(false));
//         dispatch(isClientCompleteDocModalReducer(false));
//         dispatch(isClientShareDocModalReducer(false))
//         dispatch(isDeleteChannelModalShowReducer(false))
//         dispatch(isAddDocumentModalReducer(false))
//         dispatch(isModalShowRejectReducer(false))
//         dispatch(isshowSignedDocumentModalClientPortalReducer(false));



//     }
//     return (
//         <div className='fixed left-0 top-0 bg-[#171717]/70 w-[100vw] h-[100vh] z-50 flex items-center justify-center'>
//             <div className='w-[90%] md:w-[40%]'>

//                 <div className='bg-white w-[100%] p-5 pb-10  rounded-[20px]'>
//                     {/* HEADER */}
//                     <div className='flex items-center pb-4 border-b-[1px] border-b-greyColor border-b-solid'>
//                         <div className='w-[100%]  text-center' >

//                             <p className='text-center font-semibold text-[18px]'>{props.heading}</p>

//                         </div>
//                         <div className="relative group">

//                              <RxCross2
//                                 size={24}
//                                 className='cursor-pointer'
//                                 onClick={() => {
//                                     closeModalFun();
//                                     props.onClose?.(); 
//                                 }}
//                             />
//                             <ToolTip toolTipText="Close" />
//                         </div>
//                     </div>
//                     <div>
//                         {props.modalBodyContent}
//                     </div>
//                 </div>
//             </div>

//         </div>
//     )
// }

// export default ModalLayout



// src/components/modals/modalLayout/ModalLayout.tsx
import React from "react";
import { RxCross2 } from "react-icons/rx";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import ToolTip from "../../toolTip/ToolTip";

import {
  isModalShowReducser,
  isModalDeleteReducer,
  isNewChatModalShowReducser,
  isNewGroupChatModalShowReducser,
  isClientCompleteDocModalReducer,
  isClientShareDocModalReducer,
  isDeleteChannelModalShowReducer,
  isAddDocumentModalReducer,
  isModalShowRejectReducer,
  isshowSignedDocumentModalClientPortalReducer,
  isInviteProviderModalShowReducser, // ✅ ADD THIS
  isCancelSubscriptionModalShowReducer,
  isMultiClientDocShareModalReducer,
  isDocumentRecipientsModalReducer,
  isAddMembersToGroupModalReducer,
  isGroupSettingsModalReducer,
} from "../../../redux/slices/ModalSlice";

interface ModalLayoutProps {
  modalBodyContent: React.ReactNode;
  heading: string;
  onClose?: () => void;
  widthClass?: string;
}

const ModalLayout: React.FC<ModalLayoutProps> = (props) => {
  const dispatch = useDispatch<AppDispatch>();

  const closeModalFun = () => {
    // ✅ Close ALL modals (including your new invite modal)
    dispatch(isModalShowReducser(false));
    dispatch(isModalDeleteReducer(false));
    dispatch(isNewChatModalShowReducser(false));
    dispatch(isNewGroupChatModalShowReducser(false));
    dispatch(isClientCompleteDocModalReducer(false));
    dispatch(isClientShareDocModalReducer(false));
    dispatch(isDeleteChannelModalShowReducer(false));
    dispatch(isAddDocumentModalReducer(false));
    dispatch(isModalShowRejectReducer(false));
    dispatch(isshowSignedDocumentModalClientPortalReducer(false));
    dispatch(isInviteProviderModalShowReducser(false)); // ✅ CRITICAL FIX
    dispatch(isCancelSubscriptionModalShowReducer(false));
    dispatch(isMultiClientDocShareModalReducer(false));
    dispatch(isDocumentRecipientsModalReducer(false));
    dispatch(isAddMembersToGroupModalReducer(false));
    dispatch(isGroupSettingsModalReducer(false));
  };

  const handleClose = () => {
    // ✅ Prefer specific close handler (if provided), then do global cleanup
    props.onClose?.();
    closeModalFun();
  };

  return (
    <div className="fixed left-0 top-0 bg-textColor/70 w-screen h-screen z-50 flex items-center justify-center">
      <div className={`${props.widthClass || "w-[90%] md:w-[60%] lg:w-[45%]"} max-h-[95vh] flex flex-col`}>
        <div className="bg-white w-full p-5 pb-15  rounded-[20px] overflow-y-auto">
          {/* HEADER */}
          <div className={`flex items-center pt-5  ${props.heading ? 'pb-4 border-b border-b-greyColor border-b-solid mb-4' : 'justify-end'}`}>
            {props.heading && (
              <div className="w-full text-center">
                <p className="text-center font-semibold text-[18px]">{props.heading}</p>
              </div>
            )}

            <div className="relative group">
              <RxCross2
                size={24}
                className="cursor-pointer"
                onClick={handleClose}
              />
              <ToolTip toolTipText="Close" />
            </div>

          </div>

          <div>{props.modalBodyContent}</div>
        </div>
      </div>
    </div>
  );
};

export default ModalLayout;
