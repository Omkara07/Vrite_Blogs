import axios from 'axios'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageAnimation from '../common/page-animation'
import { getDate } from '../common/Days'
import BlogInteractions from '../components/BlogInteractions.component'
import { MutatingDots } from 'react-loader-spinner'
import NotFound404 from './404.page'
import { AuthContext } from '../App'
import BlogCard from '../components/BlogCard.component'
import BlogContent from '../components/BlogContent.component'
import CommentSection from '../components/CommentSection.component'


export type ContentType = {
    blocks: any[]
}
export type blogType = {
    blog_id: string
    banner: string
    title: string
    des: string
    content: ContentType[]
    tags: string[]
    author: { personal_info: { username: string, fullname: string, profile_img: string } }
    activity: {
        total_likes: number
        total_comments: number
        total_reads: number
        total_parent_comments: number
    },
    publishedAt: string
    comments: any[]
}


const defaultBlog = {
    blog_id: "",
    banner: "",
    title: "",
    des: "",
    content: [],
    tags: [],
    author: {
        personal_info: {
            username: "",
            fullname: "",
            profile_img: ""
        }
    },
    activity: {
        total_likes: 0,
        total_comments: 0,
        total_reads: 0,
        total_parent_comments: 0,
    },
    publishedAt: "",
    comments: []
}

type props = {
    skip?: number,
    blog_id: string,
    setParentCommentFun: React.Dispatch<React.SetStateAction<number>>,
    comment_array?: []
}
export const fetchComments = async ({ skip = 0, blog_id, setParentCommentFun, comment_array = [] }: props) => {
    let res;
    await axios.post(import.meta.env.VITE_server_url + '/user/get-blog-comments', {
        blog_id: blog_id,
        skip
    })
        .then(({ data }) => {
            data.map((comment: any) => {
                comment.childrenLevel = 0;
            })

            setParentCommentFun((pre: number) => pre + data.length)

            if (!comment_array.length) {
                res = { results: data }
            }
            else {
                res = { results: [...comment_array, ...data] }
            }
        })
        .catch((e) => {
            console.log(e)
        })

    return res;
}

export const BlogPageContext = createContext<any>(null)
const BlogPage = () => {
    const { blog_id: BlogPage_id } = useParams()
    const [blog, setBlog] = useState<blogType>(defaultBlog)
    const [isLiked, setIsLiked] = useState<boolean>(false)
    const [similarBlogs, setSimilarBlogs] = useState<any>(null)
    const [commentSection, setCommentSection] = useState<boolean>(false)
    const [totalParentComments, setTotalParentComments] = useState<number>(0)
    const { userAuth: { token } } = useContext(AuthContext)
    const [loading, setLoading] = useState<boolean>(true)
    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_server_url + '/user/getBlog',
            {
                blog_id: BlogPage_id
            }
        )
            .then(async (res) => {
                const fetchedComments = await fetchComments({ blog_id: res.data.blog?.blog_id, setParentCommentFun: setTotalParentComments })
                res.data.blog.comments = fetchedComments
                setBlog(res.data.blog)
                // console.log(res.data.blog)
                await fetchSimilarBlogs(res.data.blog.tags)
                setLoading(false)
            })
            .catch((e) => {
                console.log(e)
                setLoading(false)
            })
    }
    const { blog_id, banner, title, content, tags, author: { personal_info: { username, profile_img, fullname } }, publishedAt } = blog
    const fetchSimilarBlogs = (tags = []) => {
        axios.post(import.meta.env.VITE_server_url + `/user/getBlogs?eliminate_blog=${BlogPage_id}&page=1`, {
            tags
        }, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(({ data }) => {
                setSimilarBlogs(data.blogs)
            })
            .catch((e) => {
                console.log(e)
            })
    }
    const resetState = () => {
        setBlog(defaultBlog)
        setSimilarBlogs(null)
        setLoading(true)
        setCommentSection(false)
        setTotalParentComments(0)
    }
    useEffect(() => {
        resetState()
        fetchBlog()
    }, [BlogPage_id])
    return (
        <PageAnimation >
            {
                loading ?
                    <div className='flex items-center justify-center mt-44'>
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
                    !blog_id.length ?
                        <NotFound404 />
                        :
                        <BlogPageContext.Provider value={{ blog, setBlog, isLiked, setIsLiked, totalParentComments, setTotalParentComments, commentSection, setCommentSection }}>
                            <section className='py-10' >
                                <CommentSection />
                                <div className='flex flex-col max-w-[900px] w-full mx-auto md:justify-center px-3 leading-tight placeholder-opacity-40 gap-8'>
                                    <div className='flex aspect-video rounded-lg bg-white z-20 border-4 border-gray-100'>
                                        <img className='rounded-lg select-none' src={banner} alt="" />
                                    </div>
                                    <h1 className='max-md:px-2 text-4xl font-semibold w-full outline-none resize-none font-gelasio'>
                                        {title}
                                    </h1>
                                    <hr className='w-full' />
                                    <div className='flex max-md:flex-col md:justify-between max-md:gap-5 px-5'>
                                        <Link to={`/user/${username}`} className='flex gap-2 font-gelasio text-[14px]'>
                                            <img className='w-8 h-8 rounded-full' src={profile_img} alt="" />
                                            <div className=' flex flex-col gap-1 ml-1'>
                                                <p className='capitalize font-semibold line-clamp-1 text-black'>{fullname}</p>
                                                <p className=' text-gray-600 underline text-sm'>@{username}</p>
                                            </div>
                                        </Link>
                                        <div className='flex text-gray-500 font-gelasio'>
                                            Published on {getDate(publishedAt)}
                                        </div>
                                    </div>
                                    <BlogInteractions />
                                    <div className='mb-8 mt-3 max-md:px-3 font-gelasio flex flex-col gap-4 md:gap-8'>
                                        {
                                            content[0].blocks.map((block: object, i: number) => {
                                                return <div key={i} className=''>
                                                    <BlogContent block={block} />
                                                </div>
                                            })
                                        }
                                    </div>
                                    <div className="flex gap-5 ">
                                        {
                                            tags.map((tag: string, i: number) => {
                                                return <button key={i} className={`flex items-center gap-2 text-black bg-[#F2F2F2] focus:outline-none font-medium rounded-full text-[12px] px-5 py-2`}
                                                >
                                                    {tag}
                                                </button>
                                            })
                                        }
                                    </div>
                                    <BlogInteractions />
                                    {
                                        similarBlogs && similarBlogs.length ?
                                            <>
                                                <h1 className='text-2xl font-semibold'>Similar Blogs</h1>
                                                {
                                                    similarBlogs.map((blog: any, i: number) => {
                                                        return (
                                                            <PageAnimation key={i} transition={{ duration: 0.7, delay: i * .2 }}>
                                                                <BlogCard blog={blog} author={blog.author.personal_info} />
                                                            </PageAnimation>
                                                        )
                                                    })
                                                }
                                            </> : ""
                                    }

                                </div>
                            </section>
                        </BlogPageContext.Provider>
            }
        </PageAnimation>
    )
}

export default BlogPage
