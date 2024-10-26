import React, { useContext, useState } from 'react'
import { AuthContext } from '../App'
import { toast } from 'sonner'
import axios from 'axios'
import { NotificationContext } from '../pages/Notifications.page'

type props = {
    _id: string
    blog_author: any
    index: number
    replyingTo: string
    notification_id: string
    setIsReplying: React.Dispatch<React.SetStateAction<boolean>>
}
const NotificationCommentField: React.FC<props> = ({ _id, blog_author, index, setIsReplying, replyingTo = undefined, notification_id }) => {
    const [comment, setComment] = useState<string>("")
    const { userAuth: { token } } = useContext(AuthContext)
    const { notifications, notifications: { results }, setNotifications } = useContext(NotificationContext)
    const handleComment = async () => {
        if (!comment.length) {
            toast.error("Write something to post a comment!")
        }
        await axios.post(import.meta.env.VITE_server_url + '/user/add-comment', {
            blog_id: _id,
            comment,
            replying_to: replyingTo,
            notification_id
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(async ({ data }) => {
                const updatedRes = [...results]
                updatedRes[index].reply = { comment, _id: data.comment._id }
                await setNotifications({ ...notifications, results: updatedRes })
                setIsReplying(false)
                console.log(data)
            })
            .catch((e) => {
                console.log(e)
            })
    }
    return (
        <div className='font-gelasio mt-8'>
            <textarea placeholder='Leave your Reply...' value={comment} onChange={(e) => setComment(e.target.value)} className={`h-[110px] resize-none bg-gray-100 w-full p-4 rounded-lg`}></textarea>
            <button className='text-white bg-black px-5 mt-1 py-1.5 text-[14px] rounded-full' onClick={handleComment}>Reply</button>
        </div>
    )
}

export default NotificationCommentField
