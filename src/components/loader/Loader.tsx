import React from "react";
import "./loader.css";

interface LoaderProps {
  text?: string;
  inline?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ text, inline }) => {
  if (inline) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-2 w-full min-h-50">
        <div className="loadingio-spinner-spinner-977el9wwy2v">
          <div className="ldio-4j5ay0xf86g">
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
        {text && (
          <p className="text-primaryColor text-sm font-medium">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className=" h-full w-full fixed top-0 left-0 z-99999999 bg-black/40 flex items-center justify-center">
      <div className="w-75 h-75  flex flex-col  items-center justify-center bg-white rounded-md">
        <div className="loadingio-spinner-spinner-977el9wwy2v">
          <div className="ldio-4j5ay0xf86g">
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
        <p className="text-primaryColor text-base">{text}</p>
      </div>
    </div>
  );
};

export default Loader;

// import React from 'react'
// import './loader.css'
// interface LoaderProps {
//     text?: string

// }
// const Loader: React.FC<LoaderProps> = ({ text }) => {
//     return (
//         <div className=' h-[100%] w-[100%] absolute top-0 left-0 z-[99999999] bg-black/40 flex items-center justify-center'>
//             <div className='w-[300px] h-[300px]  flex flex-col  items-center justify-center bg-white rounded-md'>
//                 <div className="loadingio-spinner-spinner-977el9wwy2v"><div className="ldio-4j5ay0xf86g">
//                     <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
//                 </div></div>
//                 <p className='text-primaryColor text-base'>{text}</p>
//             </div>

//         </div>
//     )
// }

// export default Loader
