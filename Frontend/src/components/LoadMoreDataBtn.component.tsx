import React from 'react'
import { latestBlogType } from '../pages/home.page'
type props = {
    state: latestBlogType | null,
    fetchDataFunc: ({ page }: { page: number }) => Promise<void>

}
const LoadMoreDataBtn: React.FC<props> = ({ state, fetchDataFunc }) => {
    if (state && state.results.length && state.totalBlogs > state.results.length) {
        return (
            <button onClick={() => fetchDataFunc({ page: state.page + 1 })} className='flex mx-auto text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-md hover:text-gray-700 transition duration-200'>
                Load More
            </button>
        )
    }
}

export default LoadMoreDataBtn
