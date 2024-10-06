// import React from 'react'
import NotFoundImg from '../imgs/404.png'
import { Link } from 'react-router-dom'
import { IoLogoVimeo } from 'react-icons/io'

const NotFound404 = () => {
    return (
        <div className='h-cover relaitve p-10 text-center flex flex-col justify-center items-center gap-5'>
            <img src={NotFoundImg} alt="" className='flex w-72 aspect-square rounded-sm  select-none' />
            <h1 className='flex text-4xl font-bold leading-7 font-gelasio'>Page Not Found</h1>
            <p className='font-gelasio text-gray-500 leading-7'>The page you are looking for doesn't exist. Head back to <Link to='/' className="font-semibold text-black underline" >Home Page</Link></p>

            <div className='max-md:hidden absolute bottom-3 justify-center'>
                <div className='flex items-center justify-center'>
                    <IoLogoVimeo className='text-[35px]' />
                    <h1 className="font-bold text-gray-800 font-mono text-xl">rite</h1>
                </div>
                <p className='font-gelasio text-gray-500 text-sm leading-7'>Read millions of stories around the world</p>
            </div>
        </div >
    )
}

export default NotFound404
