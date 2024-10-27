// import React from 'react'
import { useContext, useEffect, useState } from "react"
import PageAnimation from "../common/page-animation"
import InPageNavigation from '../components/InPageNavigation.component'
import axios from "axios"
import BlogCard from "../components/BlogCard.component"
import { AuthContext } from "../App"
import { MutatingDots } from "react-loader-spinner"
import MiniBlogCard from "../components/MiniBlog.component"
import { Link } from "react-router-dom"
import { HiArrowTrendingUp } from "react-icons/hi2";
import { activeTabRef } from "../components/InPageNavigation.component"
import NoData from "../components/NoData.component"
import { filterPaginationData } from "../components/FilterPagination.component"
import LoadMoreDataBtn from "../components/LoadMoreDataBtn.component"


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
export type latestBlogType = {
    results: blogType[],
    page: number,
    totalBlogs: number
}

export type trendingBlogType = {
    blog_id: string,
    title: string,
    publishedAt: string,
    author: { personal_info: authorType }
}
const Home = () => {

    const { setFilter } = useContext(AuthContext)
    const [latestBlogs, setLatestBlogs] = useState<latestBlogType | null>(null)
    const [trendingBlogs, setTrendingBlogs] = useState<trendingBlogType[] | null>(null)
    const [pageState, setPageState] = useState<string>('home')
    const { userAuth: { token } } = useContext(AuthContext)
    let categories = ["Food", "Tech", "Anime", "Music", "Supercars", "Travel", "Games", "Life", "Hollywood", "Social Media", "Finances"]

    const fetchLatestBlogs = async ({ page = 1 }) => {
        try {
            const res = await axios.get(import.meta.env.VITE_server_url + `/user/latest-blogs?filter=${pageState}&page=${page.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const latestblogs = await filterPaginationData({
                state: latestBlogs,
                data: res.data.blogs,
                page,
                token,
                counteRoute: `/user/all-latest-blogs-count?filter=${pageState}`,
            })
            setLatestBlogs(latestblogs)
        }
        catch (e) {
            console.log(e)
        }
    }
    const fetchTrendingBlogs = async () => {
        try {
            const trendingblogs = await axios.get(import.meta.env.VITE_server_url + "/user/trending-blogs", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setTrendingBlogs(trendingblogs.data.blogs)
        }
        catch (e) {
            console.log(e)
        }
    }
    useEffect(() => {
        setFilter("")
        // click on the hr button everytime the pagestate changes
        activeTabRef?.current?.click()
        fetchLatestBlogs({ page: 1 })
        if (!trendingBlogs?.length) {
            fetchTrendingBlogs()
        }
    }, [token, pageState])

    const handleChangeCategory = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const target = e.target as HTMLButtonElement
        const category = target.innerText.toLowerCase();

        setLatestBlogs(null)
        if (category === pageState) {
            setPageState('home')
            return
        }

        await setPageState(category)
    }
    return (
        <PageAnimation>

            <div className="flex h-cover justify-between md:px-44 w-full gap-12 mb-10">

                {/* latest blogs */}
                <div className={`flex flex-col max-md:pr-4 md:w-2/3`}>
                    <InPageNavigation routes={[pageState, 'trending blogs']} defaultHidden={['trending blogs']} >
                        <div className="flex flex-col gap-5">
                            {
                                !latestBlogs ?
                                    <div className='flex md:ml-44 ml-32 items-center mt-28'>
                                        {pageState === 'home' && <MutatingDots
                                            visible={true}
                                            height="100"
                                            width="100"
                                            color="black"
                                            secondaryColor="black"
                                            radius="12.5"
                                            ariaLabel="mutating-dots-loading"
                                            wrapperStyle={{}}
                                            wrapperClass=""
                                        />}
                                    </div>
                                    :
                                    !latestBlogs.results.length ? <NoData message="No Blog Yet" /> :
                                        latestBlogs.results.map((blog, i) => {
                                            return (
                                                <PageAnimation key={i} transition={{ duration: 0.7, delay: i * .2 }}>
                                                    <BlogCard blog={blog} author={blog.author.personal_info} />
                                                </PageAnimation>
                                            )
                                        })
                            }
                            <LoadMoreDataBtn state={latestBlogs} fetchDataFunc={fetchLatestBlogs} />
                        </div>


                        <div className="flex flex-col gap-7">
                            {
                                !trendingBlogs ?
                                    <div className='flex justify-center md:ml-44 items-center mt-28'>
                                        <MutatingDots
                                            visible={true}
                                            height="100"
                                            width="100"
                                            color="black"
                                            secondaryColor="black"
                                            radius="12.5"
                                            ariaLabel="mutating-dots-loading"
                                            wrapperStyle={{}}
                                            wrapperClass=""
                                        />
                                    </div>
                                    :
                                    !trendingBlogs.length ? <NoData message="No Trending Blogs" /> :
                                        trendingBlogs.map((blog, i) => {
                                            return (
                                                <PageAnimation key={i} transition={{ duration: 0.7, delay: i * .2 }}>
                                                    <MiniBlogCard blog={blog} index={i} author={blog.author.personal_info} />
                                                </PageAnimation>
                                            )
                                        })
                            }
                        </div>
                    </InPageNavigation>
                </div>

                {/* filters and trending blogs */}
                <div className={`min-w-1/3 lg:min-w-[400px] max-w-min max-md:hidden md:flex border-l`}>
                    <div className="flex flex-col my-5 mx-10 gap-5 w-full">
                        <div className="mb-5 gap-5">
                            <h1 className="font-semibold text-xl flex  items-center mb-7 text-gray-600">Stories from Similar Intrests</h1>
                            <div className="flex flex-wrap gap-3 font-gelasio">
                                {
                                    categories.map((cat: string, i: number) => {
                                        return <button key={i} className={`flex items-center gap-2 ${pageState === cat.toLowerCase() ? "text-white bg-black" : "text-black bg-[#F2F2F2]"} focus:outline-none font-medium rounded-full text-[12px] px-5 py-2`}
                                            onClick={handleChangeCategory}>
                                            {cat}
                                        </button>
                                    })
                                }
                            </div>

                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-semibold text-xl flex items-center mb-4 text-gray-600">Trending <span className="text-black font-extrabold"><HiArrowTrendingUp /></span></h1>
                            {
                                !trendingBlogs ?
                                    <div className='flex md:ml-44 items-center mt-28'>
                                        <MutatingDots
                                            visible={true}
                                            height="100"
                                            width="100"
                                            color="black"
                                            secondaryColor="black"
                                            radius="12.5"
                                            ariaLabel="mutating-dots-loading"
                                            wrapperStyle={{}}
                                            wrapperClass=""
                                        />
                                    </div>
                                    :
                                    !trendingBlogs.length ? <NoData message="No Trending Blogs" /> :
                                        trendingBlogs.map((blog, i) => {
                                            return (
                                                <PageAnimation key={i} transition={{ duration: 0.7, delay: i * .2 }}>
                                                    <MiniBlogCard blog={blog} index={i} author={blog.author.personal_info} />
                                                </PageAnimation>
                                            )
                                        })
                            }
                            <Link to='/trending-blogs' className="text-emerald-500 font-gelasio text-sm mt-8 font-semibold">See full list </Link>
                        </div>
                    </div>
                </div>

            </div>
        </PageAnimation >

    )
}

export default Home
