import React, { useContext, useState } from 'react'
import { FaCommentDollar } from 'react-icons/fa6'
import { commentType } from './CommentSection.component'
import { getDays } from '../common/Days'
import { AuthContext } from '../App'
import { toast } from 'sonner'
import CommentField from './CommentField.component'
type props = {
    commentData: commentType
    leftLev: number
    index: number
}
const CommentCard: React.FC<props> = ({ index, leftLev, commentData }) => {
    const { comment, commented_by: { personal_info: { profile_img, username } }, commentedAt } = commentData
    const [isReplying, setIsReplying] = useState<boolean>(false)
    const { userAuth: { token } } = useContext(AuthContext)
    const handleReplyClick = () => {
        if (!token) {
            toast.error("Log in to comment!")
        }
        setIsReplying(!isReplying)
    }
    return (
        <>
            <div className={`${leftLev !== 0 ? "ml-10" : ""} rounded-xl bg-[#f2f2f2] w-full px-4 py-2`}>
                <div className='flex gap-2 items-center font-gelasio text-[12px] text-gray-700'>
                    <img className='w-6 rounded-full' src={profile_img} alt="" />
                    <p className='capitalize line-clamp-1'>{username}</p>
                    <p className='font-light'>{getDays(commentedAt)}</p>
                </div>
                <p className='font-gelasio ml-2 py-3'>
                    {comment}
                </p>
                <div className='flex gap-5 items-center text-gray-500 text-sm'>
                    <button onClick={handleReplyClick}>Reply</button>
                </div>
            </div>
            <div className='mt-3'>
                {
                    isReplying && <CommentField action="reply" />
                }
            </div>
        </>
    )
}

export default CommentCard
