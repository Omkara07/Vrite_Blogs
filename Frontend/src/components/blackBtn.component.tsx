import React from 'react'

type Props = {
    value: string
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    wid?: string
}
const blackBtn: React.FC<Props> = ({ value, onClick, wid = '[70%]' }) => {
    return (
        <button type="button" className={`w-${wid} justify-center transition duration-300 ease-in-out text-white bg-[#050708] hover:bg-[#050708]/80 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-xl text-[14px] px-3 py-2 text-center inline-flex items-center dark:hover:bg-[#050708]/40 dark:focus:ring-gray-600`} onClick={onClick}>
            {value}
        </button>
    )
}

export default blackBtn
