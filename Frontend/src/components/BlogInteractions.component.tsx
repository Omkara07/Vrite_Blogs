import React, { useContext, useEffect } from 'react'
import { BlogPageContext } from '../pages/BlogPage.page'
import { GoHeartFill, GoHeart } from "react-icons/go";
import { FaRegCommentDots } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { FaXTwitter } from "react-icons/fa6";
import { AuthContext } from '../App';
import { toast } from 'sonner';
import axios from 'axios';



const BlogInteractions = () => {
    const { blog, setBlog, isLiked, setIsLiked, commentSection, setCommentSection } = useContext(BlogPageContext)
    const { userAuth: { username: LoggedUsername, token } } = useContext(AuthContext)
    console.log(blog)
    if (!blog) {
        return (
            <div>...</div>
        )
    }
    let { title, blog_id, activity, activity: { total_likes, total_comments, total_reads, total_parent_comments }, author: { personal_info: { username } } } = blog

    const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (token) {
            console.log("liked")
            setIsLiked(!isLiked)
            !isLiked ? total_likes++ : total_likes--;
            setBlog({ ...blog, activity: { ...activity, total_likes } })

            axios.post(import.meta.env.VITE_server_url + '/user/like-blog', {
                blog_id,
                isLiked
            }, {
                headers: {
                    Authorization: "Bearer " + token
                }
            })
                .then(({ data }) => {
                    console.log(data.message)
                })
        }
        else {
            toast.error("You are not logged in")
        }
    }

    const getLikes = () => {
        axios.post(import.meta.env.VITE_server_url + "/user/is-blog-liked", {
            blog_id
        },
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            })
            .then(({ data: { result } }) => {
                setIsLiked(Boolean(result))
            })
            .catch((e) => {
                console.log(e)
            })
    }
    useEffect(() => {
        getLikes()
    }, [])
    return (
        <div>
            <hr className='border-gray-100' />
            <div className='flex justify-between items-center'>
                <div className='flex gap-5 h-20 items-center'>
                    <div className='flex gap-2 items-center'>
                        <button className={`bg-[#F2F2F2] rounded-full px-3 py-2 ${isLiked ? "bg-red-100" : ""}`} onClick={handleLike}>
                            {
                                !isLiked ?
                                    <GoHeart className='text-lg' />
                                    :
                                    <GoHeartFill className='text-red-500 text-lg' />
                            }
                        </button>
                        <p className='text-gray-600 text-[17px]'>
                            {total_likes}
                        </p>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <button className='bg-[#F2F2F2] rounded-full px-3 py-2 ' onClick={() => setCommentSection((prev: boolean) => !prev)}>
                            <FaRegCommentDots />
                        </button>
                        <p className='text-gray-600 text-[17px]'>
                            {total_comments}
                        </p>
                    </div>

                </div>
                <div className='items-center flex gap-2 font-gelasio'>
                    {
                        LoggedUsername === username &&
                        <Link to={`/editor/${blog_id}`} className='flex text-gray-500 hover:text-black font font-semibold'>
                            Edit
                        </Link>
                    }
                    <Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`} target='_blank' className='px-5 items-center'>
                        <FaXTwitter className='text-xl hover:-translate-y-1 transition duration-300' />
                    </Link>
                </div>
            </div>
            <hr className='border-gray-100' />
        </div >
    )
}

export default BlogInteractions
