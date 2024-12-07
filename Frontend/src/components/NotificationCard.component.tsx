import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDays } from '../common/Days'
import PageAnimation from '../common/page-animation'
import NotificationCommentField from './NotificationCommentField.component'
import { AuthContext } from '../App'
import axios from 'axios'
import { NotificationContext } from '../pages/Notifications.page'

type props = {
    notification: any
    index: number
}
const NotificationCard: React.FC<props> = ({ notification, index }) => {
    const [isReplying, setIsReplying] = useState<boolean>(false)
    const { createdAt, reply, comment, user, user: { personal_info: { profile_img, username: his_username, fullname } }, type, blog: { _id, title, blog_id }, _id: notification_id, seen } = notification

    const { notifications, setNotifications } = useContext(NotificationContext)

    const { userAuth: { profile_img: user_img, username: user_username, token } } = useContext(AuthContext)


    const handleReply = () => {
        setIsReplying(!isReplying)
    }
    const handleDelete = async ({ commentId, type, target }: { commentId: string, type: string, target: HTMLButtonElement }) => {
        target.setAttribute("disabled", "true");
        try {
            await axios.post(`${import.meta.env.VITE_server_url}/user/delete-comment`, { _id: commentId }, {
                headers: { Authorization: "Bearer " + token }
            });
            const updatedRes = [...notifications.results];
            if (type === 'comment') {
                updatedRes.splice(index, 1);
            } else {
                delete updatedRes[index].reply;
            }
            await setNotifications({ ...notifications, results: updatedRes, totalBlogs: notifications.totalBlogs - 1, deletedDocs: notifications.deletedDocs + 1 });
        } catch (error) {
            console.error(error);
            console.log("Failed to delete the comment.");
        } finally {
            target.removeAttribute("disabled");
        }
    }
    useEffect(() => {
    }, [notifications.results[index]])
    return (
        <div className={`flex flex-col gap-1 pt-3 hover:transf pb-8 md:px-4 max-md:px-2 max-md:text-sm max-md:mx-2 rounded-sm shadow-sm hover:shadow-lg transition-transform transform hover:scale-105 duration-300 text-gray-700 font-gelasio border-black ${!seen ? " border-l-4" : ""}`}>
            <div className='flex gap-3'>
                <img className='w-9 h-9 rounded-full' src={profile_img} alt="" />
                <h1 className='flex text-lg gap-1 max-md:text-sm'>
                    <span className='capitalize line-clamp-1 max-md:hidden'>{fullname} </span>
                    <Link to={`/user/${his_username}`} className='font-semibold text-black hover:underline'>@{his_username}</Link>
                    <p>{type === 'like' ? "liked your blog" :
                        type === 'comment' ? `commented on` : 'replied on'}</p>
                </h1 >
            </div>
            <div className='px-14 gap-5 flex flex-col'>
                <h1>
                    {
                        type === 'reply' ? <div className='p-4 bg-[#f2f2f2] text-sm rounded-lg text-gray-600 duration-200'>{notification.replied_on_comment.comment}</div> : <Link to={`/blog/${blog_id}`} className='font-semibold hover:underline text-gray-600'>{`"${title}"`}</Link>
                    }
                </h1>
                <h1>
                    {
                        type !== 'like' ?
                            <div className='text-gray-600 '>{notification.comment.comment}</div> : ""
                    }
                </h1>
            </div>
            <div className='flex items-center mt-5 gap-20'>
                <p className='text-gray-500 text-sm'>{getDays(createdAt)}</p>
                {
                    type !== 'like' ?
                        <div className='flex items-center justify-between gap-20'>
                            {!notification.reply ? <button className='text-gray-500 text-sm hover:underline hover:text-black duration-200' onClick={handleReply}>Reply</button> : ""}

                            <button className='text-gray-500 text-sm hover:underline hover:text-black duration-200' onClick={(e) => handleDelete({ commentId: comment?._id, type: "comment", target: e.target as HTMLButtonElement })}>Delete</button>
                        </div> : ""
                }
            </div>

            {
                isReplying ? <PageAnimation>
                    <NotificationCommentField setIsReplying={setIsReplying} _id={blog_id} index={index} blog_author={user} replyingTo={comment._id}
                        notification_id={notification_id} />

                </PageAnimation> : ""
            }
            {
                notification.reply ? <PageAnimation>
                    <div className='flex flex-col gap-2 bg-[#f2f2f2] mt-4 ml-16 pl-5 py-3 rounded-lg'>
                        <div className='flex gap-2 items-center'>
                            <img className='w-6 h-6 rounded-full' src={user_img} alt="" />
                            <Link to={`user/${user_username}`} className='underline font-semibold text-sm capitalize line-clamp-1'>{user_username}</Link>
                            <p>replied to</p>
                            <Link to={`user/${his_username}`} className='underline font-semibold text-sm capitalize line-clamp-1'>{his_username}</Link>
                        </div>
                        <p className='ml-8'>{reply.comment}</p>
                        <button className='text-gray-500 text-sm hover:underline hover:text-black duration-200 ml-2 flex' onClick={(e) => handleDelete({ commentId: reply._id, type: "reply", target: e.target as HTMLButtonElement })}>Delete</button>
                    </div>
                </PageAnimation>
                    : ""
            }
        </div>
    )
}

export default NotificationCard
