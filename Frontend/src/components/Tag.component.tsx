import React, { useContext } from 'react'
import { RxCross2 } from 'react-icons/rx'
import { BlogContext } from '../pages/Editor.page'

type props = {
    key?: string
    value: string
}
const Tags: React.FC<props> = ({ value }) => {

    const { setBlogCreds, blogCreds } = useContext(BlogContext)
    const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
        setBlogCreds({ ...blogCreds, tags: blogCreds.tags.filter((val: string) => val != value) })
        console.log(e)
    }
    return (
        <div className="flex items-center gap-2 text-black bg-white  hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-full text-[12px] px-3 py-1.5  dark:hover:bg-gray-300 dark:focus:ring-gray-600 ">
            <p className='outline-none'>{value}</p>
            <button className='flex items-center' onClick={handleClose}>
                <RxCross2 className='flex text-[13px]' />
            </button>
        </div>
    )
}

export default Tags
