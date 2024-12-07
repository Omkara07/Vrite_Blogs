import React, { useContext } from 'react'
import { BlogPageContext, fetchComments, blogType } from '../pages/BlogPage.page'
import { RxCross2 } from "react-icons/rx";
import CommentField from './CommentField.component';
import PageAnimation from '../common/page-animation';
import CommentCard from './CommentCard.component';
import NoData from './NoData.component';
import ProfilePage from '../pages/ProfilePage.page';
import { Types } from 'mongoose';
export type commentType = {
    blog_id: string
    blog_author: string
    children: []
    childrenLevel: number
    comment: string
    commentedAt: string
    commented_by: {
        personal_info: {
            fullname: string
            username: string
            profile_img: string
        }
    }
    _id: string
    isReplyLoaded: boolean
}
const CommentSection = () => {
    const { commentSection, setCommentSection, blog: { blog_id, title, comments: { results: commentsArr }, activity: { total_parent_comments } }, blog, setBlog, totalParentComments, setTotalParentComments } = useContext(BlogPageContext)

    const loadMoreComments = async () => {
        let newCommentArr = await fetchComments({ skip: totalParentComments, blog_id, setParentCommentFun: setTotalParentComments, comment_array: commentsArr })

        setBlog((prevBlog: blogType) => ({ ...prevBlog, comments: newCommentArr }))
    }
    return (
        <div className={`max-md:w-full fixed duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[380px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden ${commentSection ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]"} font-gelasio`}>

            <div>
                <h1 className='text-xl font-semibold leading-5'>Comments</h1>
                <p className='text-[16px] text-gray-500 mt-4'>{title}</p>

                <button className='absolute flex justify-center items-center right-8 top-8 w-8 h-8 p-2 rounded-full bg-[#f2f2f2]' onClick={() => {
                    setCommentSection(!commentSection)
                }}><RxCross2 /></button>
            </div>
            <hr className='bg-gray-200 my-8 w-[120%] -ml-10' />

            <CommentField action="Comment" />

            <div className='flex flex-col gap-5 mt-8 w-full'>
                {
                    commentsArr && commentsArr.length ?
                        commentsArr.map((comment: commentType, i: number) => {
                            return <CommentCard key={i} index={i} leftLev={comment.childrenLevel} commentData={comment} />
                        })
                        :
                        <NoData message='No comments yet' />
                }
                {
                    total_parent_comments > totalParentComments &&
                    <button className='text-gray-500 hover:text-black' onClick={loadMoreComments}>Load more</button>
                }
            </div>
        </div>
    )
}

export default CommentSection
