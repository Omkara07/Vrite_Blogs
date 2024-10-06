import React, { useContext, useState } from 'react'
import PageAnimation from '../common/page-animation'
import { RxCross2 } from "react-icons/rx";
import { BlogContext } from '../pages/Editor.page';
import Tags from './Tag.component';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';
import BlackBtn from './blackBtn.component';
import axios from 'axios';
import { AuthContext } from '../App';
import { useNavigate, useParams } from 'react-router-dom';

const PublishForm = () => {
    const { blogCreds, setEditorState, setBlogCreds } = useContext(BlogContext)
    const { userAuth } = useContext(AuthContext)
    const [tag, setTag] = useState<string>("")
    const navigate = useNavigate()
    const { blog_id } = useParams()
    const handleClose = () => {
        setEditorState("editor")
    }
    //  this will prevent the use of enter key inside the title 
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    }

    const handleTagEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (blogCreds.tags.length < 8) {
                if (!blogCreds.tags.includes(tag) && tag.length) {
                    setBlogCreds({ ...blogCreds, tags: [...blogCreds.tags, tag] })
                }
                else {
                    if (!tag.length) {
                        toast.error("Tag can't be empty!")
                    }
                    else {
                        toast.error("Tag already exists!")
                    }

                }
            }
            setTag("")
        }
    }

    const handleTagVal = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTag(e.target.value)
    }

    const handlePublish = (e: React.MouseEvent<HTMLButtonElement>) => {
        const target = e.target as HTMLButtonElement;
        if (target.disabled) {
            return;
        }
        target.disabled = true
        if (!blogCreds.title.length) {
            return toast.error("Blog Title can't be empty")
        }
        if (!blogCreds.des.length || blogCreds.des.length > 200) {
            return toast.error("Enter a valid description within 200 characters")
        }
        if (!blogCreds.banner.length) {
            return toast.error("Blog must have a Banner")
        }
        if (!blogCreds.content.blocks.length) {
            return toast.error("Blog content can't be empty")
        }

        const blog = { ...blogCreds, draft: false }
        console.log(blog)

        const blogToast = toast.loading("Publishing...")
        axios.post(import.meta.env.VITE_server_url + '/user/create-blog',
            { ...blog, blogId: blog_id }, {
            headers: {
                "Authorization": `Bearer ${userAuth.token}`,
                "Content-Type": "application/json"
            }
        }).then(() => {
            target.disabled = false
            toast.dismiss(blogToast)
            toast.success("Blog Published successfully!")
            setTimeout(() => {
                navigate("/")
            }, 500);
        })
            .catch(({ res }) => {
                target.disabled = false
                toast.dismiss(blogToast)
                toast.error(res.data.message)
            })

    }
    return (
        <PageAnimation>
            <div className='grid lg:grid-cols-2 lg:items-center md:justify-center min-h-screen'>
                <button className='absolute right-10 lg:top-20 top-8 z-10' onClick={handleClose}>
                    <RxCross2 className='text-2xl' />
                </button>
                <div className='max-w-[550px] mt-16 lg:mt-0 lg:col-span-1 lg:mx-auto m-8'>
                    <p className='text-xl text-gray-600 font-semibold'>Preview</p>
                    <div className='rounded-lg shadow-sm aspect-video mt-4 lg:mt-12'>
                        <img src={blogCreds.banner} alt="" className='rounded-lg' />
                    </div>
                    <h1 className='text-4xl font-semibold mt-2 mb-2 line-clamp-1 leading-tight'>{blogCreds.title}</h1>
                    <p className='font-gelasio line-clamp-2  overflow-hidden'>{blogCreds.des}</p>
                </div>
                <div className='lg:mr-20 lg:col-span-1 m-8 justify-center'>

                    <p className='text-gray-500 font-semibold mb-2'>Blog Title</p>

                    <input className='transition duration-300 ease-in-out focus:border focus:border-gray-400 focus:ring-2 focus:ring-gray-400 px-4 py-4 bg-gray-100 rounded-xl w-full' type='text' placeholder='Blog Title' name="title" value={blogCreds.title} onChange={(e) => {
                        setBlogCreds({ ...blogCreds, title: e.target.value })
                    }} onKeyDown={handleKeyDown} />

                    <p className='text-gray-500 mt-2 lg:mt-4 font-semibold mb-2'>Description</p>

                    <textarea maxLength={200} defaultValue={blogCreds.des} onChange={(e) => {
                        setBlogCreds({ ...blogCreds, des: e.target.value })
                    }} className='w-full h-32 rounded-xl bg-gray-100 resize-none px-4 leading-7 transition duration-300 ease-in-out focus:border focus:border-gray-400 focus:ring-2 focus:ring-gray-400' onKeyDown={handleKeyDown} />

                    <p className={`text-right text-[12px] text-gray-400`}>{blogCreds.des.length} / 200 Characters</p>

                    <p className='text-gray-500 font-semibold'>Topics - (Helps in searching and ranking your blogs) </p>
                    <div className='relative w-full p-4 bg-gray-100 rounded-xl mt-2 '>
                        <input disabled={blogCreds.tags.length >= 8} className={`${blogCreds.tags.length >= 8 ? "cursor-not-allowed" : ""} transition duration-300 ease-in-out focus:border focus:border-gray-400 focus:ring-2 focus:ring-gray-400 px-4 py-4 bg-white rounded-xl w-full`} type="text" placeholder='Topics' onChange={handleTagVal} onKeyDown={handleTagEnter} value={tag} />

                        <div className='flex gap-4 mt-4 flex-wrap'>
                            {blogCreds.tags.map((v: string) => {
                                return <Tags key={nanoid()} value={v} />
                            })}
                        </div>
                        <p className={`text-right text-[12px] text-gray-500 mt-6`}>{blogCreds.tags.length} / 8 Tags</p>
                    </div>

                    <div className='flex mt-6 mx-auto justify-center'>
                        <BlackBtn value='Publish' onClick={handlePublish} />
                    </div>
                </div>
            </div>
        </PageAnimation>
    )
}

export default PublishForm
