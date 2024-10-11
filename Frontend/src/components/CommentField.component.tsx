import React, { useContext, useState } from 'react'
import { AuthContext } from '../App'
import { toast } from 'sonner'
import axios from 'axios'
import { BlogPageContext } from '../pages/BlogPage.page'
import { Types } from 'mongoose'

type props = {
    action: string
    index?: number
    replying_to?: string
    setReplying?: any
}
const CommentField: React.FC<props> = ({ action, index, replying_to, setReplying }) => {
    console.log(replying_to)
    const [comment, setComment] = useState<string>("")
    const { userAuth: { token, username, profile_img } } = useContext(AuthContext)
    // @ts-ignore
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
            comment,
            replying_to
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(({ data }) => {
                console.log(data.comment)
                setComment("")
                data.comment.commented_by = { personal_info: { username, profile_img } }

                let newCommentArr;

                console.log(replying_to, index)
                if (replying_to && index != undefined) {
                    // console.log(commentArr[index])
                    commentArr[index].children.push(data.comment._id)

                    data.comment.childrenLevel = commentArr[index].childrenLevel + 1;
                    data.comment.parentIndex = index;

                    commentArr[index].isReplyLoaded = true;
                    commentArr.splice(index + 1, 0, data.comment)

                    newCommentArr = commentArr

                    setReplying(false)
                }
                else {
                    data.comment.childrenLevel = 0;

                    newCommentArr = [data.comment, ...commentArr];
                }

                let parentCommentIncremental = replying_to ? 0 : 1;

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
