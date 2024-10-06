import React, { useContext } from 'react'
import { BlogPageContext } from '../pages/BlogPage.page'
import { RxCross2 } from "react-icons/rx";
import CommentField from './CommentField.component';


const CommentSection = () => {
    const { commentSection, setCommentSection, blog: { title } } = useContext(BlogPageContext)
    return (
        <div className={`max-sm:w-full fixed duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden ${commentSection ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]"} font-gelasio`}>

            <div>
                <h1 className='text-xl font-semibold leading-5'>Comments</h1>
                <p className='text-[16px] text-gray-500 mt-4'>{title}</p>

                <button className='absolute flex justify-center items-center right-8 top-8 w-8 h-8 p-2 rounded-full bg-[#f2f2f2]' onClick={() => {
                    setCommentSection(!commentSection)
                }}><RxCross2 /></button>
            </div>
            <hr className='bg-gray-200 my-8 w-[120%] -ml-10' />

            <CommentField action="Comment" />
        </div>
    )
}

export default CommentSection
