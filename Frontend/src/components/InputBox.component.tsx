import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaGlobe } from 'react-icons/fa6';


type Props = {
    type: string,
    value?: string,
    placeholder: string,
    icon?: any,
    name: string
    disabled?: boolean
    wid?: string
    fromEditPage?: boolean
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}
const InputBox: React.FC<Props> = ({ type, placeholder, value, icon, name, onChange, disabled = false, wid = "[70%]", fromEditPage = false }) => {
    const [passvis, setPassvis] = useState<boolean>(false)
    return (
        <div className={`flex items-center w-${wid}`}>
            {
                fromEditPage ?
                    <div className={`absolute text-gray-700 translate-x-2.5 items-center`}>
                        {
                            name !== "website" ? <FontAwesomeIcon icon={icon} /> : <FaGlobe />
                        }
                    </div>
                    : <i className={`absolute fi ${icon} mt-1 text-gray-400 translate-x-2.5 items-center`}></i>

            }
            <input className='transition duration-300 ease-in-out focus:border focus:border-gray-400 focus:ring-2 focus:ring-gray-400 pl-9 px-3 py-4 bg-[#f2f2f2] rounded-xl w-full' type={passvis ? "text" : type} placeholder={placeholder} name={name} onChange={onChange} value={value} disabled={disabled} />
            {
                type == "password" ?
                    <i className={`relative fi ${passvis ? "fi-rr-eye" : "fi-rr-eye-crossed"} mt-1 text-gray-400 right-7 w-0`} onClick={() => { setPassvis(!passvis) }}></i>
                    : ""
            }
        </div >
    )
}

export default InputBox
