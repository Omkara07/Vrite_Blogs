import React from 'react'
import { trendingBlogType, authorType } from '../pages/home.page'
import { Link } from 'react-router-dom'
import { getDays } from '../common/Days'

type miniBlogType = {
    blog: trendingBlogType,
    author: authorType,
    index: number
}
const MiniBlogCard: React.FC<miniBlogType> = ({ blog: { title, blog_id, publishedAt }, index, author: { fullname, username, profile_img } }) => {
    return (
        <Link to={`/blog/${blog_id}`} className='max-md:pl-6 flex w-full gap-2 py-3 items-center'>
            <h1 className='text-6xl font-extrabold text-gray-300 font-gelasio mr-2'>{index < 10 ? "0" + (index + 1) : index + 1}</h1>
            <div className='flex flex-col gap-1 text-sm'>
                <div className='flex gap-1 text-[11px] mb-1 font-gelasio items-center text-sm'>
                    <img className='w-5 rounded-full' src={profile_img} alt="" />
                    <p className='capitalize line-clamp-1'>{fullname} <span className='font-semibold'>@{username}</span></p>
                </div>
                <h2 className='text-[17px] line-clamp-2 font-bold'>{title}</h2>
                <p className='min-w-fit text-gray-500 text-[11px] font-gelasio'>{getDays(publishedAt)}</p>
            </div>
        </Link>
    )
}

export default MiniBlogCard
