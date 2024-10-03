import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageAnimation from '../common/page-animation'

type blogType = {
    blog_id: string
    banner: string
    title: string
    des: string
    content: any
    tags: string[]
    author: any
    activity: {
        total_likes: number
        total_comments: number
        total_reads: number
        total_parent_comments: number
    }
}
const BlogPage = () => {
    const { blog_id: BlogPage_id } = useParams()
    const [blog, setBlog] = useState<blogType | null>(null)
    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_server_url + '/user/getBlog',
            {
                blog_id: BlogPage_id
            }
        )
            .then(res => {
                setBlog(res.data.blog)
                console.log(res.data)
            })
    }
    useEffect(() => {
        fetchBlog()
    }, [])
    return (
        <PageAnimation >
            <section>
                <div className='flex flex-col max-w-[900px] w-full mx-auto md:justify-center px-3 leading-tight placeholder-opacity-40 '>
                    <div className='flex aspect-video bg-white z-50 border-4 border-gray-100 hover:opacity-80'>
                        <img src={blog?.banner} alt="" />
                    </div>
                    <h1 className='mt-10 text-4xl font-semibold w-full h-20 outline-none resize-none'>
                        {blog?.title}
                    </h1>
                    <hr className='w-ful my-5' />
                    <div id='textEditor' className='font-gelasio'></div>
                </div>
            </section>
        </PageAnimation>
    )
}

export default BlogPage
