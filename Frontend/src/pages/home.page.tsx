// import React from 'react'
import { useEffect, useState } from "react"
import PageAnimation from "../common/page-animation"
import InPageNavigation from '../components/InPageNavigation.component'
import axios from "axios"
import BounceLoader from "react-spinners/BounceLoader"
import BlogCard from "../components/BlogCard.component"
import { RxCross2 } from "react-icons/rx"

export type authorType = {
    fullname: string,
    username: string,
    profile_img: string
}
export type blogType = {
    blog_id: string,
    title: string,
    des: string,
    banner: string,
    activity: any,
    tags: string[],
    publishedAt: string,
    author: { personal_info: authorType }
}
const Home = () => {

    const [blogs, setBlogs] = useState<blogType[] | null>(null)
    const [expandLatestBlog, setExpandLatestBlog] = useState<boolean>(false)

    useEffect(() => {
        axios.get(import.meta.env.VITE_server_url + "/user/latest-blogs", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then(({ data }) => {
                setBlogs(data.blogs)
            })
            .catch(e => {
                console.log(e)
            })
    }, [])

    return (
        <PageAnimation>

            <div className="flex h-cover justify-between md:px-44 w-full gap-12 mb-10">

                {/* latest blogs */}
                <div className={`flex justify-center flex-col pr-10`}>
                    <InPageNavigation routes={["home", 'trending blogs']} defaultHidden={['trending blogs']} >
                        <div className="flex flex-col gap-8">
                            {
                                blogs === null ? <BounceLoader
                                    className="mt-48 flex mx-auto items-center"
                                    color="black"
                                    size={44}
                                    speedMultiplier={1.5}
                                /> :
                                    blogs.map((blog, i) => {
                                        return (
                                            <PageAnimation key={i} transition={{ duration: 0.7, delay: i * .2 }}>
                                                <BlogCard blog={blog} author={blog.author.personal_info} />
                                            </PageAnimation>
                                        )
                                    })
                            }
                        </div>


                        <h1>Trending Blogs and tags</h1>
                    </InPageNavigation>
                </div>

                {/* filters and trending blogs */}
                <div className={`hidden w-1/3 md:flex border-l`}>
                    <h1>Filter and Trends</h1>
                </div>

            </div>
        </PageAnimation>

    )
}

export default Home
