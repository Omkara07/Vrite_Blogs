import React, { useContext } from 'react'
import { IoLogoVimeo } from 'react-icons/io'
import { Link } from 'react-router-dom'
import PageAnimation from '../common/page-animation'
import { useRef } from 'react'
import uploadImage from '../common/aws'
import { toast } from 'sonner'
import { BlogContext } from '../pages/Editor.page'
import BlogBanner from '../imgs/blog banner.png'


const BlogEditor = () => {
  const { blogCreds, setBlogCreds } = useContext(BlogContext)
  const bannerRef = useRef<HTMLImageElement | null>(null);
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = e?.target?.files?.[0] || null
    if (img) {
      let imgToast = toast.loading("Uploading...")
      try {
        const url = await uploadImage({ img })
        if (url) {
          if (bannerRef.current) {
            bannerRef.current.src = url
            setBlogCreds({ ...blogCreds, banner: url }) // updates only the banner
            toast.dismiss(imgToast)
            toast.success("Uploaded successfully")
          }
        }
      }
      catch (e: any) {
        toast.dismiss(imgToast)
        toast.error(e.message)
      }
    }
    console.log(img)
  }

  //  this will prevent the use of enter key inside the title 
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBlogCreds({ ...blogCreds, title: e.target.value });  // updates only the title
    // this will set the height of the input box === to the scroll height and remove the scroll bar
    e.target.style.height = e.target.scrollHeight + "px"
  }

  const handleError = (e: React.ChangeEvent<HTMLImageElement>) => {
    e.target.src = BlogBanner
  }
  return (
    <>
      <nav className='flex items-center w-full mx-auto flex-row gap-10 h-16 px-4 py-6 shadow-sm border-b-1'>
        <Link to="/" className='flex  items-center'>
          <IoLogoVimeo className='text-[35px]' />
          <h1 className="font-bold text-gray-800 font-mono text-xl">rite</h1>
        </Link>
        <div className='flex w-full max-md:hidden line-clamp-1 font-mono font-semibold text-gray-500'>
          {blogCreds?.title || "New Blog"}
        </div>
        <div className='flex gap-3 py-5 px-3 ml-auto'>
          <Link to='/'>
            <button type="button" className="text-white bg-[#050708] hover:bg-[#050708]/80 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-full text-[12px] px-3 py-1.5 text-center inline-flex items-center dark:hover:bg-[#050708]/40 dark:focus:ring-gray-600">
              Publish
            </button>
          </Link>
          <Link to=''>
            <button type="button" className={`md:flex text-black bg-gray-200  hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-full text-[12px] px-3 py-1.5 text-center items-center dark:hover:bg-gray-300 dark:focus:ring-gray-600 `}>
              Draft
            </button>
          </Link>
        </div>
      </nav>
      <PageAnimation >
        <section>
          <div className='flex flex-col max-w-[900px] w-full mx-auto md:justify-center px-3 leading-tight placeholder-opacity-40 '>
            <div className='flex aspect-video bg-white z-50 border-4 border-gray-100 hover:opacity-80'>
              <label htmlFor="BannerUpload">
                <img ref={bannerRef} src={blogCreds.banner} alt="" onError={handleError} />
                <input
                  id="BannerUpload"
                  type="file"
                  accept='.jpg, .png, .jpeg'
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
            <textarea placeholder='Blog Title' className='mt-10 text-4xl font-semibold w-full h-20 outline-none resize-none' onKeyDown={handleKeyDown} onChange={handleTitleChange}>
            </textarea>
            <hr className='w-ful my-5' />

            <div id='textEditor' className='font-gelasio'></div>
          </div>
        </section>
      </PageAnimation>
    </>
  )
}

export default BlogEditor
