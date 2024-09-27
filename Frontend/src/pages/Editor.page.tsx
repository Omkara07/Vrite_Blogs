import { useEffect, useState, memo, createContext } from 'react'
// import { AuthContext } from '../App'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import BlogEditor from '../components/BlogEditor.component'
import PublishForm from '../components/PublishForm.component'

type BlogType = {
    title: string,
    banner: string,
    content: [],
    tags: [],
    des: string
}

export const BlogContext = createContext<any>({})

const Editor = memo(() => {
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
    }, [])
    // console.log(userAuth)
    return (
        <BlogContext.Provider value={{ blogCreds, setBlogCreds, editorState, setEditorState, textEditor, setTextEditor }}>
            <>
                {
                    editorState === "editor" ? <BlogEditor /> : <PublishForm />
                }
            </>
        </BlogContext.Provider>
    )
})

export default Editor
