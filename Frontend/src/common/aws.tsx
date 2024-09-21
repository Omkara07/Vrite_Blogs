import axios from "axios"

type props = {
    img: File
}
const uploadImage = async ({ img }: props): Promise<string> => {
    let imgURL = ''
    try {
        await axios.get(import.meta.env.VITE_server_url + '/user/get-upload-url').then(
            async ({ data: { uploadURL } }) => {
                await axios({
                    method: 'PUT',
                    url: uploadURL,
                    headers: { "Content-Type": "multipart/form-data" },
                    data: img
                })
                    .then(() => {
                        imgURL = uploadURL.split('?')[0];
                    })
            }
        )
    }
    catch (e) {
        console.log(e)
    }
    return imgURL
}

export default uploadImage
