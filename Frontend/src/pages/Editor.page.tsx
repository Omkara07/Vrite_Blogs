import { useEffect, useState, memo, createContext } from 'react'
// import { AuthContext } from '../App'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import BlogEditor from '../components/BlogEditor.component'
import PublishForm from '../components/PublishForm.component'
import axios from 'axios'
import { MutatingDots } from 'react-loader-spinner'

type BlogType = {
    title: string,
    banner: string,
    content: [],
    tags: [],
    des: string
}

export const BlogContext = createContext<any>({})

const Editor = memo(() => {
    const { blog_id } = useParams()
    const [loading, setLoading] = useState<boolean>(true)
    const [blogCreds, setBlogCreds] = useState<BlogType>({
        title: "",
        banner: "",
        content: [],
        tags: [],
        des: ""
    })

    // const { userAuth } = useContext(AuthContext)
    const navigate = useNavigate()
    const [editorState, setEditorState] = useState<string>("editor")
    const [textEditor, setTextEditor] = useState({ isReady: false })

    useEffect(() => {
        // console.log(userAuth)
        const userLogged = localStorage.getItem("userAuth")
        if (!userLogged) {
            toast.error("You are not logged in")
            navigate('/signin')
        }
        if (!blog_id) {
            return setLoading(false)
        }
        axios.post(import.meta.env.VITE_server_url + "/user/getBlog", {
            blog_id,
            isEdit: true,
            draft: true
        })
            .then(({ data }) => {
                setBlogCreds(data.blog)
                console.log(blogCreds)
                setLoading(false)
            })
            .catch((e) => {
                console.log(e)
                setLoading(false)
            })
    }, [])
    // console.log(userAuth)
    return (
        <BlogContext.Provider value={{ blogCreds, setBlogCreds, editorState, setEditorState, textEditor, setTextEditor }}>
            <>
                {
                    loading ? <div className='flex justify-center items-center mt-44'>
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
                        editorState === "editor" ? <BlogEditor /> : <PublishForm />
                }
            </>
        </BlogContext.Provider>
    )
})

export default Editor
