
interface TableProps {
  heading?: React.ReactNode[];
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
          <table className="min-w-full text-primaryColor">
            <thead className="bg-inputBgColor capitalize tracking-wider font-normal text-[14px] font-[Poppins]">
              <tr>
                {heading?.map((item: React.ReactNode, index: number) => (
                  <th className="px-4 py-3 text-left font-semibold" key={index}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody className='text-textColor text-[14px] font-normal text-left w-full lg:w-full'>
              {children}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Table