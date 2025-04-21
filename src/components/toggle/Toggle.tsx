
interface ToggleProps {
    id?: string;
    label?: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    dataTestId?: string;  // Add this line

}

const Toggle: React.FC<ToggleProps> = (props) => {
    return (
        <div className="flex items-start space-x-2 ">
            <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" checked={props.checked} onChange={props.onChange} />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-textGreyColor 
                   peer-checked:after:translate-x-full
                  rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
                  after:absolute after:top-0.5   after:start-[2px] after:bg-white  
                  after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-primaryColorDark outline-0
                   "></div>
                <p className="ml-2">{props.label}</p>
            </label>

        </div>
    );
};

export default Toggle;
