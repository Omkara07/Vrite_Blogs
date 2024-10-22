import { useContext, useEffect, useState } from "react"
import { useDebounce } from "../hooks/useDebounce"
import axios from "axios"
import { AuthContext } from "../App"
import { blogType } from "./home.page"
import BlogCard from "../components/BlogCard.component"
import LoadMoreDataBtn from "../components/LoadMoreDataBtn.component"
import PageAnimation from "../common/page-animation"
import { MutatingDots } from "react-loader-spinner"
import NoData from "../components/NoData.component"
import { authorType } from "./home.page"
import UserCard from "../components/UserCard.component"
import InPageNavigation, { activeTabRef } from "../components/InPageNavigation.component"
import { FaRegUser } from "react-icons/fa6";
import { filterPaginationData } from "../components/FilterPagination.component"

export type usersType = {
    personal_info: authorType
}
export type blogsType = {
    results: blogType[],
    page: number,
    totalBlogs: number
}

const Search = () => {
    const [blogs, setBlogs] = useState<blogsType | null>(null)
    const [users, setUsers] = useState<usersType[] | null>(null)
    const [loading, setLoading] = useState(false);
    const { userAuth: { token }, filter } = useContext(AuthContext)
    const debounceval = useDebounce(filter)

    const loadBlogs = async ({ page = 1, create_new_arr = false }) => {
        try {
            console.log(debounceval)
            const res = await axios.post(import.meta.env.VITE_server_url + `/user/getBlogs?filter=${debounceval}&page=${page}`, {}, {
                headers: {
                    Authorization: "Bearer " + token
                }
            })
            const latestblogs = await filterPaginationData({
                state: blogs,
                data: res.data.blogs,
                page,
                token,
                create_new_arr,
                counteRoute: `/user/all-search-blogs-count?filter=${debounceval}`,
            })
            setBlogs(latestblogs)
        }
        catch (e) {
            console.log(e)
        }
    }

    const loadUsers = () => {
        axios.get(import.meta.env.VITE_server_url + "/user/getAuthors?filter=" + debounceval, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(res => {
                setUsers(res.data.users)
            })

    }
    const resetState = () => {
        setBlogs(null)
        setUsers(null)
    }
    useEffect(() => {
        if (!debounceval || !token) {
            // If there's no debounce value or token, don't make the request yet
            return;
        }
        resetState()
        activeTabRef?.current?.click()
        setLoading(true)
        const fetchData = async () => {
            await loadBlogs({ page: 1, create_new_arr: true })
            await loadUsers()
            setLoading(false)
        }
        fetchData()
    }, [debounceval, token])
    console.log(blogs)
    return (
        <div className="h-cover w-full">
            {loading ?
                <div className='flex md:mx-auto justify-center items-center mt-44'>
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
                <div className="flex w-full h-cover md:px-10">
                    <div className="flex flex-col gap-5 md:px-20 my-8 md:w-2/3">

                        <InPageNavigation routes={[`Search results for ${debounceval}`, "Accounts Matched"]} defaultHidden={["Accounts Matched"]} >
                            <div className="flex flex-col gap-5">
                                {
                                    !blogs ? <NoData message={`Type something to Search`} /> :
                                        <>
                                            {
                                                !blogs.results.length ? <NoData message={`No Blogs yet`} /> :
                                                    blogs.results.map((blog, i) => {
                                                        return (
                                                            <PageAnimation key={i} transition={{ duration: 0.7, delay: i * .2 }}>
                                                                <BlogCard blog={blog} author={blog.author.personal_info} />
                                                            </PageAnimation>
                                                        )
                                                    })
                                            }
                                        </>
                                }
                                <LoadMoreDataBtn state={blogs} fetchDataFunc={loadBlogs} />
                            </div>
                            <div className="flex flex-col gap-7 px-10">
                                <h1 className="flex font-semibold text-gray-700 text-lg items-center gap-2"><p>Users Matched</p> <FaRegUser className="font-bold text-lg" /></h1>
                                {
                                    users && <div className="w-full flex flex-col my-10 gap-8">
                                        {
                                            !users.length ? <NoData message={`No Users found`} ml={0} /> :
                                                users.map((user, i) => {
                                                    return (
                                                        <PageAnimation key={i} transition={{ duration: 0.7, delay: i * .2 }}>
                                                            <UserCard user={user.personal_info} />
                                                        </PageAnimation>
                                                    )
                                                })
                                        }
                                    </div>
                                }
                            </div>
                        </InPageNavigation>
                    </div>
                    <div className="min-w-1/3 lg:min-w-[400px] max-w-min max-md:hidden md:flex border-l flex-col px-20 my-8 ">
                        <h1 className="flex font-semibold text-gray-700 text-lg items-center gap-2"><p>Users Matched</p> <FaRegUser className="font-bold text-lg" /></h1>
                        {
                            users && <div className="w-full flex flex-col my-10 gap-8">
                                {
                                    !users.length ? <NoData message={`No Users found`} ml={0} /> :
                                        users.map((user, i) => {
                                            return (
                                                <PageAnimation key={i} transition={{ duration: 0.7, delay: i * .2 }}>
                                                    <UserCard user={user.personal_info} />
                                                </PageAnimation>
                                            )
                                        })
                                }
                            </div>
                        }
                    </div>
                </div>
            }
        </div>
    )
}

export default Search
