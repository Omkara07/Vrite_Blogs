// import React from 'react'
import PageAnimation from '../common/page-animation'
import { Link, useNavigate } from 'react-router-dom'
import { MdEditDocument } from 'react-icons/md'
import { toast } from 'sonner';
import { Dispatch, SetStateAction, useContext } from 'react';
import { AuthContext } from '../App';

type Props = {
    username: string
    setUserNav: Dispatch<SetStateAction<boolean>>
}

const User_Navigation: React.FC<Props> = ({ username, setUserNav }) => {

    const navigate = useNavigate()
    const { setUserAuth } = useContext(AuthContext)
    return (
        <PageAnimation
            transition={{ duratio: 0.2 }}
            className={`absolute right-0 z-50 mt-10`}
        >
            <div className='absolute duration-200 right-5 bg-gray-100  w-48 justify-center rounded-xl border'>
                <Link to='/editor' className='md:hidden flex justify-center gap-2 text-gray-500 items-center hover:text-black hover:font-semibold duration-100 hover:bg-white p-2.5'>
                    < MdEditDocument />
                    <h3 className=''>Write</h3>
                </Link>
                <Link to={`/user/${username}`} className='flex justify-center gap-2  text-gray-500 items-center hover:font-semibold hover:text-black duration-100 hover:bg-white p-2.5'>
                    <h3>Profile</h3>
                </Link>
                <Link to='/dashboard/blogs' className='flex justify-center gap-2  text-gray-500 items-center hover:font-semibold hover:text-black duration-100 hover:bg-white p-2.5'>
                    <h3>Dashboard</h3>
                </Link>
                <Link to='/settings/edit-profile' className='flex justify-center  text-gray-500 items-center hover:font-semibold hover:text-black duration-100 gap-2 hover:bg-white p-2.5'>
                    <h3>Settings</h3>
                </Link>
                <hr className='' />
                <button className='flex justify-center items-center hover:bg-gray-800 flex-col w-full rounded-b-xl hover:rounded-t-xl bg-black text-white py-1 pb-2' onClick={() => {
                    localStorage.removeItem("userAuth")
                    setUserNav(false)
                    setUserAuth({ email: "", username: "", profile_img: "", token: "", new_notifications: false })
                    toast.success("User Logged out")
                    navigate("/signin")
                }}>
                    <h1 className='flex font-bold'>Logout</h1>
                    <h2 className='flex text-gray-300 text-sm'>{`@${username}`}</h2>
                </button>
            </div>
        </PageAnimation>
    )
}

export default User_Navigation
