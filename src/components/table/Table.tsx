



interface TableProps {
  heading?: string[];
  children?: React.ReactNode;

}


const Table: React.FC<TableProps> = ({
  heading,
  children
}) => {
  return (
    <div className="container mx-auto w-full overflow-x-auto ">

      <div className=" overflow-x-auto ">
        <div className=" px-4 sm:px-0 overflow-x-auto ">

          <table className="min-w-full text-primaryColor  overflow-x-auto ">
            <thead className=" bg-inputBgColor mb-2 capitalize tracking-wider font-normal text-[14px] font-[Poppins]  overflow-x-auto ">
              <tr className=' overflow-x-auto '>
                {heading?.map((heading: string) => (
                  <th className="px-2.5 py-3 text-left font-semibold" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className='text-textColor  text-[14px] capitalize  font-[400] text-left'>
              {children}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Table