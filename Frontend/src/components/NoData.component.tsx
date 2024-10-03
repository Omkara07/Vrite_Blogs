import React from 'react'

type props = {
    message: string
    ml?: number
}
const NoData: React.FC<props> = ({ message, ml = 44 }) => {
    return (
        <h1 className={`flex mt-10 mx-${ml} font-semibold text-gray-600 font-gelasio w-full`}>
            {message}
        </h1>
    )
}

export default NoData
