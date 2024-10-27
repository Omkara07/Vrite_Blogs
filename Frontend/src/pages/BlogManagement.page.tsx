import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../App'
import { filterPaginationData } from '../components/FilterPagination.component'
import { IoMdSearch } from 'react-icons/io'
import { useDebounce } from '../hooks/useDebounce'
import InPageNavigation from '../components/InPageNavigation.component'
import ManageBlogCard from '../components/ManageBlogCard.component'
import { MutatingDots } from 'react-loader-spinner'
import NoData from '../components/NoData.component'
import PageAnimation from '../common/page-animation'
import LoadMoreDataBtn from '../components/LoadMoreDataBtn.component'
import { useSearchParams } from 'react-router-dom'

type blogsType = {
    results: any[]
    totalBlogs: number
    deletedDocs?: number
    page: number
}
const BlogManagement = () => {
    const [blogs, setBlogs] = useState<blogsType | null>(null)
    const [drafts, setDrafts] = useState<blogsType | any>(null)
    const [query, setQuery] = useState<string>("")
    const { userAuth: { token } } = useContext(AuthContext)
    const debounceVal = useDebounce(query)
    const activeNavTab = useSearchParams()[0].get("tag")
    console.log(activeNavTab)
    const getBlogs = ({ page, draft = false, deletedDocs = 0 }: { page: number, draft?: boolean, deletedDocs?: number }) => {
        axios.post(import.meta.env.VITE_server_url + '/user/written-blogs', {
            page,
            draft,
            deletedDocs,
            query: debounceVal
        }, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(async ({ data }) => {
                const formattedData = await filterPaginationData({
                    data: data.blogs,
                    state: draft ? drafts : blogs,
                    page,
                    token,
                    data_to_send: { draft, query: debounceVal },
                    counteRoute: '/user/written-blogs-count'
                })
                console.log("draft:", draft, formattedData)
                if (draft) {
                    setDrafts(formattedData)
                }
                else {
                    setBlogs(formattedData)
                }
            })
            .catch((e) => {
                console.log(e)
            })
    }
    useEffect(() => {
        if (blogs == null) {
            getBlogs({ page: 1, draft: false })
        }
        if (drafts == null) {
            getBlogs({ page: 1, draft: true })
        }
    }, [token, debounceVal])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const eve = e.target as HTMLButtonElement
        const searchVal = eve.value
        setQuery(searchVal)
        setBlogs(null)
        setDrafts(null)
    }

    return (
        <div className='w-full px-10'>
            <h1 className='max-md:hidden text-xl text-gray-600 mb-8 font-semibold'>Manage Blogs</h1>
            <div className="flex w-[50%] max-md:w-full max-md:-mt-8 items-center focus-within:text-black">
                <IoMdSearch className="absolute flex translate-x-2 text-gray-500 text-xl focus:text-black" />
                <input value={query} onChange={handleChange} type="text" placeholder="Search" className="transition duration-300 ease-in-out md:flex pl-8 w-full bg-[#F2F2F2] p-2 rounded-xl focus:outline-none focus:bg-white" />
            </div>
            <InPageNavigation routes={['Published Blogs', 'Drafts']} inPageNavIndex={activeNavTab != "draft" ? 0 : 1}>
                <div>
                    {
                        blogs === null ? <div className='flex items-center max-md:justify-center md:ml-60 mt-32'>
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
                            <div className='flex flex-col gap-8'>{
                                blogs.results.length ?
                                    <>{
                                        blogs.results.map((blog: any, i: number) => {
                                            return <PageAnimation key={i} transition={{ delay: i * 0.2 }}>
                                                <ManageBlogCard blog={blog} index={i} stateFunc={setBlogs} />
                                            </PageAnimation>
                                        })
                                    }
                                        < LoadMoreDataBtn state={blogs} fetchDataFunc={getBlogs} additionalParams={{ deletedDocs: blogs.deletedDocs ? blogs.deletedDocs : 0, draft: false }} />
                                    </>
                                    :
                                    <div className='mx-auto'>
                                        <NoData message='No Blogs yet' />
                                    </div>
                            }
                            </div>
                    }
                </div>
                <div>
                    {
                        drafts === null ? <div className='flex items-center max-md:justify-center md:ml-60 mt-32'>
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
                            drafts.results.length ?
                                <>
                                    {

                                        drafts.results.map((draft: any, i: number) => {
                                            return <PageAnimation key={i} transition={{ delay: i * 0.2 }}>
                                                <ManageBlogCard blog={draft} index={i} stateFunc={setDrafts} />
                                            </PageAnimation>
                                        })
                                    }
                                    < LoadMoreDataBtn state={drafts} fetchDataFunc={getBlogs} additionalParams={{ deletedDocs: drafts.deletedDocs ? drafts.deletedDocs : 0, draft: true }} />
                                </>
                                :
                                <div className='mx-auto'>
                                    <NoData message='No Drafts yet' />
                                </div>
                    }
                </div>

            </InPageNavigation>
        </div>
    )
}

export default BlogManagement
