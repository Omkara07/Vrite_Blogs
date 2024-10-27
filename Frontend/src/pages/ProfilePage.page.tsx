import axios from 'axios'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AuthContext } from '../App'
import PageAnimation from '../common/page-animation'
import { MutatingDots } from 'react-loader-spinner'
import AboutUser from '../components/AboutUser.component'
import { latestBlogType } from './home.page'
import { filterPaginationData } from '../components/FilterPagination.component'
import InPageNavigation, { activeTabRef } from '../components/InPageNavigation.component'
import NoData from '../components/NoData.component'
import BlogCard from '../components/BlogCard.component'
import LoadMoreDataBtn from '../components/LoadMoreDataBtn.component'
import NotFound404 from './404.page'
import { userNavRef } from '../components/navbar.component'

export type userType = {
    personal_info: {
        fullname: string,
        email: string,
        username: string
        bio: string
        profile_img: string
    }
    social_links: { [key: string]: string }
    account_info: {
        total_posts: number
        total_reads: number
    }
    joinedAt: string
    _id: string
}

export const defaultUser = {
    personal_info: {
        fullname: "",
        email: "",
        username: "",
        bio: "",
        profile_img: ""
    },
    social_links: {},
    account_info: {
        total_posts: 0,
        total_reads: 0
    },
    joinedAt: "",
    _id: ""
}
const ProfilePage = () => {
    const { userAuth: { token } } = useContext(AuthContext)
    const { id: profileId } = useParams()
    const [loading, setLoading] = useState(true)
    const { userAuth: { username } } = useContext(AuthContext)
    const [user, setUser] = useState<userType>(defaultUser)
    const [blogs, setBlogs] = useState<latestBlogType | null>(null)
    const otherElementRef = useRef<HTMLDivElement | null>(null)

    let { personal_info: { username: profile_username, fullname, profile_img, bio }, social_links, account_info: { total_posts, total_reads }, joinedAt, _id } = user


    const fetchUser = () => {
        axios.post(import.meta.env.VITE_server_url + `/user/get-profile`, {
            username: profileId
        }, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(res => {
                if (res.data != null) {
                    setUser(res.data)
                }
                fetchBlogs({ page: 1, id: res.data._id, create_new_arr: true })
                setLoading(false)
            })
            .catch((e) => {
                console.log(e)
                setLoading(false)
            })
    }

    const fetchBlogs = async ({ page = 1, id = _id, create_new_arr = false }) => {
        try {
            const res = await axios.get(import.meta.env.VITE_server_url + `/user/latest-blogs?id=${id}&page=${page.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const latestblogs = await filterPaginationData({
                state: blogs,
                data: res.data.blogs,
                page,
                token,
                create_new_arr,
                counteRoute: `/user/all-latest-blogs-count?id=${id}`,
            })
            setBlogs(latestblogs)
        }
        catch (e) {
            console.log(e)
        }
    }
    console.log(blogs)

    const resetState = () => {
        setBlogs(null)
        setUser(defaultUser)
    }
    const manualBlur = () => {
        // userNavRef?.current?.focus()
        // setTimeout(() => {
        //     otherElementRef?.current?.focus();
        // }, 100);
    }
    useEffect(() => {
        manualBlur()
        resetState()
        activeTabRef?.current?.click()
        fetchUser()
    }, [profileId])
    return (
        <PageAnimation>
            {
                loading ? <div className='flex md:ml-44 ml-32 items-center mt-28'>
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
                </div> :
                    profile_username.length ?
                        <div className='flex mb-5' ref={otherElementRef}>
                            <div className='md:flex md:px-20 md:w-full max-md:w-full h-cover pt-6 overflow-hidden min-[1100px]:gap-12 gap-5 '>
                                <div className="flex flex-col gap-7 md:w-full md:px-20">
                                    <div className='flex flex-col md:hidden max-md:items-center gap-5 min-w-[250px] mb-6'>
                                        <img src={profile_img} className='md:w-32 w-48 rounded-full' alt="Profile Picture" />
                                        <h1 className='text-gray-600 text-2xl font-semibold'>@{profile_username}</h1>
                                        <h1 className='text-xl capitalize'>{fullname}</h1>
                                        <p className=''>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads</p>
                                        <div className='flex gap-4 mt-2'>
                                            {
                                                profileId === username ?
                                                    <Link to="/settings/edit-profile" className='py-1.5 px-3 rounded-lg bg-gray-200' >
                                                        Edit Profile
                                                    </Link>
                                                    : ""
                                            }
                                        </div>
                                    </div>
                                    <InPageNavigation routes={[`${profile_username}'s Blogs`, 'About User']} defaultHidden={['About User']} cap={false}>
                                        <div className="flex flex-col gap-5  md:justify-between w-full">
                                            {
                                                !blogs ?
                                                    <div className='flex md:ml-44 items-center mt-28'>
                                                        {/* <MutatingDots
                                                        visible={true}
                                                        height="100"
                                                        width="100"
                                                        color="black"
                                                        secondaryColor="black"
                                                        radius="12.5"
                                                        ariaLabel="mutating-dots-loading"
                                                        wrapperStyle={{}}
                                                        wrapperClass=""
                                                    /> */}
                                                    </div>
                                                    :
                                                    !blogs.results.length ? <NoData message="No Blog Yet" /> :
                                                        blogs.results.map((blog, i) => {
                                                            return (
                                                                <PageAnimation key={i} transition={{ duration: 0.7, delay: i * .2 }}>
                                                                    <BlogCard blog={blog} author={blog.author.personal_info} />
                                                                </PageAnimation>
                                                            )
                                                        })
                                            }
                                            <LoadMoreDataBtn state={blogs} fetchDataFunc={fetchBlogs} />
                                        </div>
                                        <div className='flex w-full'>
                                            <AboutUser classname='p-10' bio={bio} joinedAt={joinedAt} social_links={social_links} />
                                        </div>
                                    </InPageNavigation>
                                </div>
                            </div>

                            <div className='md:flex md:px-auto flex-row-reverse h-cover hidden pt-6 overflow-hidden min-[1100px]:gap-12 gap-5 min-w-1/3 lg:min-w-[400px] max-w-min max-md:hidden border-l'>
                                {
                                    !blogs ? <div className='flex md:ml-44 items-center mt-28'>
                                        {/* <MutatingDots
                                        visible={true}
                                        height="100"
                                        width="100"
                                        color="black"
                                        secondaryColor="black"
                                        radius="12.5"
                                        ariaLabel="mutating-dots-loading"
                                        wrapperStyle={{}}
                                        wrapperClass=""
                                    /> */}
                                    </div>
                                        :
                                        <div className='flex flex-col max-md:items-center gap-5 min-w-[250px] mx-auto md:items-center'>
                                            <img src={profile_img} className='flex md:w-32 w-48 rounded-full' alt="" />
                                            <h1 className='flex text-gray-600 text-2xl font-semibold'>@{profile_username}</h1>
                                            <h1 className='flex text-xl capitalize'>{fullname}</h1>
                                            <p className='flex'>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads</p>
                                            <div className='flex gap-4 mt-2'>
                                                {
                                                    profileId === username ?
                                                        <Link to='settings/edit-profile' className='flex py-1.5 px-3 rounded-lg bg-gray-200' >
                                                            Edit Profile
                                                        </Link>
                                                        : ""
                                                }
                                            </div>
                                            <AboutUser classname='max-md:hidden' bio={bio} joinedAt={joinedAt} social_links={social_links} />
                                        </div>
                                }
                            </div>
                        </div>
                        : <NotFound404 />
            }
        </PageAnimation>
    )
}

export default ProfilePage
