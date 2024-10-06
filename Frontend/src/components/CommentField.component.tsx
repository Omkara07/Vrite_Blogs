import React, { useState } from 'react'

type props = {
    action: string
}
const CommentField: React.FC<props> = ({ action }) => {
    const [comment, setComment] = useState<string>("")
    return (
        <div className='font-gelasio'>
            <textarea placeholder='Leave your comment...' value={comment} onChange={(e) => setComment(e.target.value)} className='h-[120px] resize-none bg-[#f2f2f2] w-full p-4 rounded-lg'></textarea>
            <button className='text-white bg-black px-5 mt-1 py-1.5 text-[14px] rounded-full'>{action}</button>
        </div>
    )
}

export default CommentField
