import React, { useContext, useState } from 'react'
import { getDays } from '../common/Days'
import { Link } from 'react-router-dom'
import { CiCalendarDate } from "react-icons/ci";
import { FiEdit } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { IoStatsChartSharp } from "react-icons/io5";
import axios from 'axios';
import { AuthContext } from '../App';


type prop = {
    blog: any
    index: number
    stateFunc: React.Dispatch<any>
}
const ManageBlogCard: React.FC<prop> = ({ blog, index, stateFunc }) => {
    const { title, banner, activity, blog_id, publishedAt } = blog
    const [showStat, setShowStat] = useState<boolean>(false)
    const { userAuth: { token } } = useContext(AuthContext)

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        const target = e.target as HTMLButtonElement
        target.setAttribute("disabled", "true")
        axios.post(import.meta.env.VITE_server_url + '/user/delete-blog', {
            blog_id
        }, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(({ data }) => {
                target.removeAttribute("disabled")
                stateFunc((prev: any) => {
                    let { deletedDocs, totalDocs, results } = prev

                    results.splice(index, 1)
                    if (!deletedDocs) {
                        deletedDocs = 0;
                    }
                    if (!results.length && totalDocs - 1 > 0) {
                        return null
                    }
                    return { ...prev, deletedDocs: deletedDocs + 1, results, totalDocs: totalDocs - 1 }

                })
            })
            .catch((e) => [
                console.log(e)
            ])
    }
    return (
        <div className='flex justify-between max-md:pb-6 border-gray-200 border-b pb-6 w-full hover:shadow-lg transition-transform transform hover:scale-105 duration-300 md:px-4'>
            <div className='flex flex-col justify-between gap-3 md:w-1/2'>
                <div className='max-md:w-full md:w-80 aspect-video bg-gray-300 rounded-xl'>
                    <img src={banner} alt="blog banner" className='w-full h-full aspect-video rounded-xl object' />
                </div>
                <div className='flex flex-col gap-2'>
                    <Link to={`/blog/${blog_id}`} className='hover:underline md:text-2xl text-xl font-bold line-clamp-1'>{title}</Link>
                    <p className='font-gelasio text-sm min-w-fit flex items-center gap-2 text-gray-500'><CiCalendarDate />{getDays(publishedAt)}</p>
                </div>
                <div className='md:hidden flex gap-7 mt-3 items-center font-gelasio text-gray-500'>
                    <Link to={`/editor/${blog_id}`} className='hover:underline flex items-center gap-1 hover:text-black'><FiEdit />Edit</Link>
                    <button className='hover:underline flex items-center gap-1 md:hidden hover:text-black' onClick={() => {
                        setShowStat(!showStat)
                    }}><IoStatsChartSharp />Stats</button>
                    <button className='hover:underline hover:text-red-700 flex items-center gap-1 text-red-500' onClick={handleDelete}><MdOutlineDeleteOutline />Delete</button>
                </div>
                {
                    showStat ?
                        <div className='w-full my-5 '>
                            <ShowStats stats={activity} />
                        </div> : ""
                }
            </div>
            <div className='max-md:hidden flex flex-col w-1/2 justify-center items-center mr-16'>
                <ShowStats stats={activity} />
                <div className='flex gap-20 items-center pl-16 w-full font-gelasio text-gray-500 mt-2'>
                    <Link to={`/editor/${blog_id}`} className='hover:underline flex items-center gap-2 hover:text-black'><FiEdit />Edit</Link>
                    <button className='hover:underline hover:text-red-700 flex items-center gap-2 text-red-500' onClick={handleDelete}><MdOutlineDeleteOutline />Delete</button>
                </div>
            </div>

        </div>
    )
}

type statsType = {
    stats: any
}
const ShowStats: React.FC<statsType> = ({ stats }) => {
    return (
        <div className='flex md:h-32 w-full justify-center'>
            {
                Object.keys(stats).map((key, index) => {
                    return (key.includes("parent") ? "" :
                        <div key={index} className={`flex flex-col items-center w-full `} >
                            <p className='flex gap-2 items-center font-bold md:text-2xl text-gray-600 font-gelasio'>{stats[key].toLocaleString()}</p>
                            <p className='flex gap-2 max-md:text-sm items-center text-gray-500 capitalize'>{key.split('_')[1]}</p>
                        </div>
                    )
                })
            }
        </div >
    )
}

export default ManageBlogCard
