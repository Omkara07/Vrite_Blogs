import React from 'react'
import { blogType, authorType } from '../pages/home.page'
import { Link } from 'react-router-dom'
import { getDays } from '../common/Days'

type blogs = {
    blog: blogType
    author: authorType
}
const BlogCard: React.FC<blogs> = ({ blog: { blog_id, title, des, banner, activity, publishedAt, tags }, author: { fullname, profile_img, username } }) => {
    return (
        <Link to={`/blog/${blog_id}`} className='pl-6 md:pl-0 flex w-full items-center gap-6 justify-between max-md:p-4 border-b pb-2'>
            <div className='flex flex-col gap-2 md:text-sm text-[12px]'>
                <div className='flex gap-2 items-center font-gelasio text-[12px]'>
                    <img className='w-6 rounded-full' src={profile_img} alt="" />
                    <p className='capitalize line-clamp-1'>{fullname} <span className='font-semibold'>@{username}</span></p>
                </div>
                <h2 className='text-2xl font-bold'>{title}</h2>
                <p className='text-gray-600 font-semibold font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2'>{des}</p>
                <div className='flex gap-4 items-center mt-3'>
                    <p className='max-w-fit text-sm items-center text-gray-700 flex px-3 py-1 bg-[#F2F2F2] font-semibold rounded-xl'>{tags[0]}</p>
                    <svg className='w-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20-.1-.1s0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5l0 3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2l0-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" /></svg>
                    <p>{activity.total_likes}</p>
                </div>
                <p className='min-w-fit text-gray-500 font-gelasio mt-2'>{getDays(publishedAt)}</p>
            </div>
            <div className='h-20 w-28 md:h-28 md:w-48 aspect-video bg-gray-300 rounded-xl'>
                <img src={banner} alt="blog banner" className='w-full h-full aspect-video rounded-xl object' />
            </div>
        </Link>
    )
}

export default BlogCard
