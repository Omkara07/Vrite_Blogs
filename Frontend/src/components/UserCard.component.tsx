import React from 'react'
import { authorType } from '../pages/home.page'
import { Link } from 'react-router-dom'

type props = {
    user: authorType
}
const UserCard: React.FC<props> = ({ user }) => {
    return (
        <Link to={`/user/${user.username}`} className='flex w-full gap-8 items-center'>
            <img className='w-8 h-8 rounded-full' src={user.profile_img} alt="" />
            <div className='flex flex-col gap-2 font-gelasio text-[12px]'>
                <p className='capitalize text-[16px] font-bold'>{user.fullname}</p>
                <p className='font-semibold text-gray-500 flex justify-start'>@{user.username}</p>
            </div>
        </Link>
    )
}

export default UserCard
