import React, { useContext, useEffect, useRef, useState } from 'react'
import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { AuthContext } from '../App'
import { TiDocumentText } from "react-icons/ti";
import { FaBell } from "react-icons/fa6";
import { FaRegUser, FaUnlockAlt } from "react-icons/fa";
import { MdEditDocument } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";




const SideNav = () => {
    const page = location.pathname.split('/')[2]
    const { userAuth: { token } } = useContext(AuthContext)
    const [pageState, setPageState] = useState<string>(page.replace('-', ' '))
    const [showSidenav, setShowSidenav] = useState<boolean>(false);

    let activeTabLine = useRef<HTMLHRElement | null>(null);
    let sideBarIconTab = useRef<HTMLButtonElement | null>(null);
    let pageStateTab = useRef<HTMLButtonElement | null>(null);

    const changePageState = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { offsetWidth, offsetLeft } = e.target as HTMLButtonElement;
        if (activeTabLine.current) {
            activeTabLine.current.style.width = `${offsetWidth}px`
            activeTabLine.current.style.left = `${offsetLeft}px`

            if (e.target == sideBarIconTab.current) {
                setShowSidenav(true)
            }
            else {
                setShowSidenav(false)
            }
        }
    }

    useEffect(() => {
        setShowSidenav(false)
        pageStateTab?.current?.click()
    }, [pageState])
    return (
        !token.length ? <Navigate to='/signin' /> :
            <>
                <section className='relative flex gap-10 py-0 m-0 max-md:flex-col md:ml-32'>

                    <div className='sticky md:top-[75px] top-[68px] z-20 bg-white'>

                        <div className='md:hidden border-b border-gray-200 flex flex-nowrap overflow-x-auto items-center'>
                            <button className='px-5 py-3 capitalize' onClick={changePageState} ref={sideBarIconTab}>
                                <GiHamburgerMenu className='pointer-events-none' />
                            </button>
                            <button className='px-5 py-3 capitalize font-semibold text-gray-500' onClick={changePageState} ref={pageStateTab}>
                                {pageState}
                            </button>
                            <hr className='absolute rounded-xl h-1 bottom-0 duration-500 bg-gray-600' ref={activeTabLine} />

                        </div>

                        <div className={`min-w-[200px] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-gray-300 md:border-r absolute max-md:top-[50px] bg-white max-md:w-[calc(100%+20px)] max-md:px-16 max-md:-ml-7 duration-500 ${!showSidenav ? "max-md:opacity-0 max-md:hidden" : "opacity-100"} h-[calc(100vh-80px-60px)]`}>
                            <h1 className='text-xl text-gray-600 mb-3 font-semibold'>Dashboard</h1>
                            <hr className='border-gray-300 -ml-6 mb-8 mr-6' />

                            <NavLink to='/dashboard/blogs' onClick={() => setPageState('Blogs')} className='sidebar-link '>
                                <TiDocumentText />
                                Blogs
                            </NavLink>
                            <NavLink to='/dashboard/notification' onClick={() => setPageState('notification')} className='sidebar-link '>
                                <FaBell />
                                Notification
                            </NavLink>
                            <NavLink to='/editor' onClick={() => setPageState('editor')} className='sidebar-link '>
                                <MdEditDocument />
                                Write
                            </NavLink>

                            <h1 className='text-xl text-gray-600 mb-3 font-semibold mt-16'>Settings</h1>
                            <hr className='border-gray-300 -ml-6 mb-8 mr-6' />

                            <NavLink to='/settings/edit-profile' onClick={() => setPageState('Edit Profile')} className='sidebar-link '>
                                <FaRegUser />
                                Edit Profile
                            </NavLink>

                            <NavLink to='/settings/change-password' onClick={() => setPageState('Change Password')} className='sidebar-link '>
                                <FaUnlockAlt />
                                Change Password
                            </NavLink>
                        </div>
                    </div>


                    <div className='my-5 w-full'>
                        <Outlet />
                    </div>
                </section>

            </>
    )
}

export default SideNav
