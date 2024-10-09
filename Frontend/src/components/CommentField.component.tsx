import React, { useContext, useState } from 'react'
import { AuthContext } from '../App'
import { toast } from 'sonner'
import axios from 'axios'
import { BlogPageContext } from '../pages/BlogPage.page'

type props = {
    action: string
}
const CommentField: React.FC<props> = ({ action }) => {
    const [comment, setComment] = useState<string>("")
    const { userAuth: { token, username, profile_img } } = useContext(AuthContext)
    const { blog, blog: { blog_id, activity: { total_comments, total_parent_comments }, activity, comments, comments: { results: commentArr } }, setBlog, totalParentComments, setTotalParentComments } = useContext(BlogPageContext)
    const handleComment = () => {
        if (!token) {
            toast.error("Log in to comment!")
        }
        if (!comment.length) {
            toast.error("Write something to post a comment!")
        }
        axios.post(import.meta.env.VITE_server_url + '/user/add-comment', {
            blog_id,
            comment
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(({ data }) => {
                setComment("")

                data.comment.commented_by = { personal_info: { username, profile_img } }

                let newCommentArr;

                data.comment.childrenLevel = 0;

                newCommentArr = [data.comment, ...commentArr];
                let parentCommentIncremental = 1;

                setBlog({ ...blog, comments: { ...comments, results: newCommentArr }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncremental } })

                setTotalParentComments((prev: number) => prev + parentCommentIncremental)
            })
            .catch((e) => {
                console.log(e)
            })
    }
    return (
        <div className='font-gelasio'>
            <textarea placeholder='Leave your comment...' value={comment} onChange={(e) => setComment(e.target.value)} className={`${action !== "reply" ? "h-[120px]" : "h-[80px]"} resize-none bg-gray-100 w-full p-4 rounded-lg`}></textarea>
            <button className='text-white bg-black px-5 mt-1 py-1.5 text-[14px] rounded-full' onClick={handleComment}>{action}</button>
        </div>
    )
}

export default CommentField
