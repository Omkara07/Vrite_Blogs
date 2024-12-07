import axios from "axios";
import { latestBlogType } from "../pages/home.page";
type Props = {
    create_new_arr?: boolean
    state: any
    data: any
    page: any
    counteRoute: any
    token: string
    data_to_send?: any

}

export const filterPaginationData = async ({ create_new_arr = false, data_to_send, state, data, page, counteRoute, token }: Props): Promise<latestBlogType> => {

    let obj;

    let bodyData = {};
    if (data_to_send) {
        bodyData = data_to_send
    }
    if (!create_new_arr && state != null) {
        obj = { ...state, results: [...state.results, ...data], page: page }
    }
    else {
        await axios.post(import.meta.env.VITE_server_url + counteRoute, data_to_send, {
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
