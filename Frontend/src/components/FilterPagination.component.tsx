import axios from "axios";
import { latestBlogType } from "../pages/home.page";
type Props = {
    create_new_arr?: boolean
    state: any
    data: any
    page: any
    counteRoute: any
    token: string
}

export const filterPaginationData = async ({ create_new_arr = false, state, data, page, counteRoute, token }: Props): Promise<latestBlogType> => {

    let obj;

    if (!create_new_arr && state != null) {
        obj = { ...state, results: [...state.results, ...data], page: page }
    }
    else {
        await axios.get(import.meta.env.VITE_server_url + counteRoute, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(({ data: { totalDocs } }) => {
                obj = { results: data, page: 1, totalBlogs: totalDocs }
            })
            .catch(err => {
                console.log(err)
            })
    }
    return obj
}
