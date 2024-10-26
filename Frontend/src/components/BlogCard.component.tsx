import React, { useContext, useEffect, useState } from 'react'
import { blogType, authorType } from '../pages/home.page'
import { Link } from 'react-router-dom'
import { getDays } from '../common/Days'
import { GoHeart, GoHeartFill } from 'react-icons/go'
import axios from 'axios'
import { AuthContext } from '../App'
import { toast } from 'sonner'

type blogs = {
    blog: blogType
    author: authorType
}

const BlogCard: React.FC<blogs> = ({ blog: { blog_id, title, des, banner, activity, publishedAt, tags }, author: { fullname, profile_img, username } }) => {

    const [isLiked, setIsLiked] = useState<boolean>(false)
    const { userAuth: { token } } = useContext(AuthContext)
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
        <Link to={`/blog/${blog_id}`} className='pl-6 md:pl-0 flex w-full items-center gap-6 justify-between max-md:p-4 border-b pb-2'>
            <div className='flex flex-col gap-2 md:text-sm text-[12px]'>
                <div className='md:hidden mb-2 w-full md:h-28 md:w-48 aspect-video bg-gray-300 rounded-xl'>
                    <img src={banner} alt="blog banner" className='w-full h-full aspect-video rounded-xl object' />
                </div>
                <div className='flex gap-2 items-center font-gelasio text-[12px]'>
                    <img className='w-6 rounded-full' src={profile_img} alt="" />
                    <p className='capitalize line-clamp-1'>{fullname} <span className='font-semibold'>@{username}</span></p>
                </div>
                <h2 className='text-2xl font-bold'>{title}</h2>
                <p className='text-gray-600 font-semibold font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2'>{des}</p>
                <div className='flex gap-4 items-center mt-3'>
                    <p className='max-w-fit text-sm items-center text-gray-700 flex px-3 py-1 bg-[#F2F2F2] font-semibold rounded-xl'>{tags[0]}</p>
                    <button className={`bg-[#F2F2F2] rounded-full px-3 py-2 ${isLiked ? "bg-red-100" : ""}`}>
                        {
                            !isLiked ?
                                <GoHeart className='text-lg' />
                                :
                                <GoHeartFill className='text-red-500 text-lg' />
                        }
                    </button>
                    <p>{activity.total_likes}</p>
                </div>
                <p className='min-w-fit text-gray-500 font-gelasio mt-2'>{getDays(publishedAt)}</p>
            </div>
            <div className='max-md:hidden h-20 w-28 md:h-28 md:w-48 aspect-video bg-gray-300 rounded-xl'>
                <img src={banner} alt="blog banner" className='w-full h-full aspect-video rounded-xl object' />
            </div>
        </Link>
    )
}

export default BlogCard
