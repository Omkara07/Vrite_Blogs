import React, { useContext, useState } from 'react'
import { FaCommentDollar } from 'react-icons/fa6'
import { commentType } from './CommentSection.component'
import { getDays } from '../common/Days'
import { AuthContext } from '../App'
import { toast } from 'sonner'
import CommentField from './CommentField.component'
import { BlogPageContext } from '../pages/BlogPage.page'
import axios from 'axios'
import PageAnimation from '../common/page-animation'
import { FaReply } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";


type props = {
    commentData: commentType
    leftLev: number
    index: number
}
const CommentCard: React.FC<props> = ({ index, leftLev, commentData }) => {
    const { comment, commented_by: { personal_info: { profile_img, username: commented_by_username } }, commentedAt, _id: id, children } = commentData
    const [isReplying, setIsReplying] = useState<boolean>(false)
    const { blog: { activity, activity: { total_parent_comments }, comments, comments: { results: commentArr }, author: { personal_info: { username: author } } }, setBlog, blog, setTotalParentComments } = useContext(BlogPageContext)
    const { userAuth: { token, username } } = useContext(AuthContext)
    const handleReplyClick = () => {
        if (!token) {
            toast.error("Log in to comment!")
        }
        setIsReplying(!isReplying)
    }

    const getParentIndex = () => {
        let startingPoint = index - 1;
        try {
            while (commentArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
                startingPoint--;
            }
        }
        catch {
            startingPoint = -1;
        }

        return startingPoint;
    }
    const removeCommentCards = (startingPoint: number, isDelete = false) => {
        if (commentArr[startingPoint]) {
            while (commentArr[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentArr.splice(startingPoint, 1)
                if (!commentArr[startingPoint]) {
                    break;
                }
            }
        }
        if (isDelete) {
            let parentIndex = getParentIndex()

            if (parentIndex != -1) {
                commentArr[parentIndex].childrenLevel = commentArr[parentIndex].children.filter((child: any) => child != id)

                if (!commentArr[parentIndex].children.length) {
                    commentArr[parentIndex].isReplyLoaded = false;
                }
            }
            commentArr.splice(index, 1);
        }
        if (commentData.childrenLevel === 0 && isDelete) {
            setTotalParentComments((pre: number) => pre - 1)
        }
        setBlog({ ...blog, comments: { results: commentArr }, activity: { ...activity, total_parent_comments: total_parent_comments - commentData.childrenLevel === 0 && isDelete ? 1 : 0 } })
    }
    const hideReplies = () => {
        commentData.isReplyLoaded = false;
        removeCommentCards(index + 1)
    }
    const loadReplies = ({ skip = 0, curIndex = index }: { skip?: number, curIndex?: number }) => {

        if (commentArr[curIndex].children.length) {
            hideReplies()
            axios.post(import.meta.env.VITE_server_url + "/user/get-replies", {
                _id: commentArr[curIndex]._id,
                skip
            })
                .then(({ data: { replies } }) => {
                    commentArr[curIndex].isReplyLoaded = true;
                    for (let i = 0; i < replies.length; i++) {
                        replies[i].childrenLevel = commentArr[curIndex].childrenLevel + 1;
                        commentArr.splice(curIndex + 1 + i + skip, 0, replies[i])
                    }
                    setBlog({ ...blog, comments: { ...comments, results: commentArr } })
                })
                .catch(e => {
                    console.log(e)
                })
        }
    }
    const deleteComment = (e: React.MouseEvent<HTMLButtonElement>) => {
        const btn = e.currentTarget
        btn?.setAttribute('disabled', 'true')

        axios.post(import.meta.env.VITE_server_url + "/user/delete-comment", {
            _id: id
        }, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
            .then(() => {
                btn?.removeAttribute('disabled')
                removeCommentCards(index + 1, true)
            })
            .catch(e => {
                btn?.removeAttribute('disabled')
                console.log(e)
            })

    }

    const LoadMoreReplies = () => {
        const parentIndex = getParentIndex()
        if (commentArr[index + 1]) {
            if (commentArr[index + 1].childrenLevel < commentArr[index].childrenLevel) {
                if (index - parentIndex < commentArr[parentIndex].children.length)
                    return (<button className='text-gray-500 py-2 flex items-center px-8 hover:text-black' onClick={() => loadReplies({ skip: index - parentIndex, curIndex: parentIndex })}>

                        Load more replies
                    </button>
                    )
            }
        }
        else if (index + 1 === commentArr.length && parentIndex > -1)
            if (index - parentIndex < commentArr[parentIndex].children.length)
                return (
                    <button className='text-gray-500 py-2 flex items-center px-8 hover:text-black' onClick={() => loadReplies({ skip: index - parentIndex, curIndex: parentIndex })}>

                        Load more replies
                    </button>
                )
    }
    return (
        <PageAnimation transition={{ duration: 0.7, delay: index * .1 }}>

            <div className={`rounded-xl bg-[#f2f2f2] px-4 py-2`} style={{ marginLeft: `${leftLev * 20}px` }} >
                <div className='flex gap-2 items-center font-gelasio text-[12px] text-gray-700'>
                    <img className='w-6 rounded-full' src={profile_img} alt="" />
                    <p className='capitalize line-clamp-1'>{commented_by_username}</p>
                    <p className='font-light'>{getDays(commentedAt)}</p>
                </div>
                <p className='font-gelasio text-[15px] ml-2 py-3'>
                    {comment}
                </p>
                <div className='flex gap-1 items-center text-gray-500 text-sm'>
                    {
                        commentData.isReplyLoaded ?
                            <button className='text-gray-600 px-3 py-1 flex items-center' onClick={hideReplies}>
                                {`Hide ${children.length > 1 ? "Replies" : "Reply"}`}
                            </button> :
                            children.length ? <button className='text-gray-600 px-3 py-1 flex items-center gap-1' onClick={() => loadReplies({})}>
                                <FaReply className='text-gray-400' />{`${children.length} ${children.length > 1 ? "Replies" : "Reply"}`}
                            </button> : ""
                    }
                    <button onClick={handleReplyClick}>Reply</button>
                    {
                        username === commented_by_username || username === author ?
                            <button className='flex items-end ml-auto hover:text-red-600 p-2 rounded-xl hover:bg-red-100' onClick={deleteComment}>< AiOutlineDelete className='pointer-events-none' /> </button>
                            : ""
                    }
                </div>
            </div>
            <div className='mt-3'>
                {
                    isReplying && <CommentField action="reply" replying_to={id} index={index} setReplying={setIsReplying} />
                }
            </div>
            <LoadMoreReplies />
        </PageAnimation>
    )
}


export default CommentCard
