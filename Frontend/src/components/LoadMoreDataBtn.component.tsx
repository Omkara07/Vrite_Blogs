import React from 'react'
import { latestBlogType } from '../pages/home.page'
type props = {
    state: latestBlogType | null,
    fetchDataFunc: ({ page }: { page: number, deletedDocs?: number, draft?: boolean }) => (Promise<void> | void)
    additionalParams?: { deletedDocs: number, draft?: boolean }

}
const LoadMoreDataBtn: React.FC<props> = ({ state, fetchDataFunc, additionalParams }) => {
    if (state && state.results.length && state.totalBlogs > state.results.length) {
        let funcParams: any = { page: state?.page + 1 }
        if (additionalParams) {
            if (additionalParams.deletedDocs) funcParams.deleteDocs = additionalParams.deletedDocs
            if (additionalParams.draft) funcParams.draft = additionalParams.draft
        }
        return (
            <button onClick={() => fetchDataFunc(funcParams)} className='flex mx-auto text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-md hover:text-gray-700 transition duration-200'>
                Load More
            </button>
        )
    }
}

export default LoadMoreDataBtn
