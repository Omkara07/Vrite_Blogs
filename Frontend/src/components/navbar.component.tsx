import { useContext, useRef, useState } from 'react'
import { IoMdSearch, IoLogoVimeo } from "react-icons/io";
import { MdEditDocument } from "react-icons/md";
import "../index.css"
import { Link } from 'react-router-dom';
import { FaBell } from "react-icons/fa6";
import User_Navigation from './User-navigation.component';
import { AuthContext } from '../App';

const Navbar = () => {
    const [search, setSearch] = useState<boolean>(false);
    const { userAuth } = useContext(AuthContext)
    const [openUserNav, setUserNav] = useState<boolean>(false)
    const userNavRef = useRef<HTMLDivElement | null>(null)

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!userNavRef.current?.contains(e.relatedTarget as Node)) {
            setTimeout(() => {
                setUserNav(false)
            }, 200);
        }
    }

    const handleOnMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
    }

    return (
        <>
            <nav className='flex h-16 px-4 items-center justify-between shadow-sm font-sans'>
                <div className='flex w-full'>
                    <Link to="/" className='flex items-center'>
                        <IoLogoVimeo className='text-[35px]' />
                        <h1 className="font-bold text-gray-800 font-mono text-xl">rite</h1>
                    </Link>
                    <div className="hidden md:flex w-[30%] items-center focus-within:text-black">
                        <IoMdSearch className="absolute translate-x-12 text-gray-500 text-xl focus:text-black" />
                        <input type="text" placeholder="Search" className="transition duration-300 ease-in-out md:flex ml-10 pl-8 w-full bg-gray-100 p-2 rounded-xl focus:outline-none focus:bg-white" />
                    </div>
                </div>
                <div className='flex items-center md:gap-4 gap-2'>
                    <Link to='/editor' className={`hidden md:flex items-center text-gray-500 gap-1 mx-12 hover:text-gray-700 hover:font-semibold duration-150`}>
                        < MdEditDocument />
                        <h3 className=''>Write</h3>
                    </Link>
                    <button className="md:hidden flex items-center" onClick={() => setSearch(prev => !prev)}>
                        <IoMdSearch className="flex text-xl focus:text-black" />
                    </button>
                    {userAuth ?
                        <div className='flex gap-4 md:gap-12 ml-6'>
                            <button><FaBell className='flex hover:text-lg duration-150 z-30 ' /></button>
                            <div className='flex' ref={userNavRef}
                                // this will close the userNav panel on clicking outside of it 
                                onBlur={handleBlur}
                                // this will prevent the userNav panel from closing on the clicks inside of the panel
                                onMouseDown={handleOnMouseDown}>
                                <button className='flex w-8  border-black border-2 rounded-full md:mr-2' onClick={() => {
                                    // console.log(userAuth.profile_img)
                                    setUserNav(prev => !prev)
                                }}>
                                    <img src={userAuth.profile_img} className='rounded-full' />
                                </button>
                                {openUserNav && <User_Navigation username={userAuth.username} setUserNav={setUserNav} />}
                            </div>
                        </div>
                        :
                        < div className='flex gap-3'>
                            <Link to='/signin'>
                                <button type="button" className="text-white bg-[#050708] hover:bg-[#050708]/80 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-full text-[12px] px-3 py-1.5 text-center inline-flex items-center dark:hover:bg-[#050708]/40 dark:focus:ring-gray-600">
                                    Signin
                                </button>
                            </Link>
                            <Link to='/signup'>
                                <button type="button" className={`hidden md:flex text-black bg-gray-200  hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-full text-[12px] px-3 py-1.5 text-center items-center dark:hover:bg-gray-300 dark:focus:ring-gray-600 `}>
                                    Signup
                                </button>
                            </Link>
                        </div>
                    }
                </div>
            </nav >
            <div className={`md:hidden transition-all duration-500 ease-in-out ${search ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0'} flex w-auto items-center focus-within:text-black z-3`}>
                <input type="text" placeholder="Search" className="md:flex ml-12 w-[80%] bg-gray-100 p-2 rounded-xl " />
                <IoMdSearch className="flex ml-[-25px] text-gray-500 text-xl focus:text-black" />
            </div>
        </>
    )
}

export default Navbar
