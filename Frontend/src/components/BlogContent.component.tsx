import React, { useState } from 'react'
import { FaLink } from "react-icons/fa";

const BlogContent: React.FC<any> = ({ block }) => {
    return (
        <div>
            {
                block?.type === 'header' ?
                    block.data.level == 2 ?
                        <h1 className='text-3xl font-bold' dangerouslySetInnerHTML={{ __html: block.data.text }}></h1>
                        :
                        <h2 className='text-2xl font-bold' dangerouslySetInnerHTML={{ __html: block.data.text }}></h2>
                    : ""
            }
            {
                block.type === 'paragraph' ?
                    <p className='font-gelasio' dangerouslySetInnerHTML={{ __html: block.data.text }}></p> : ""
            }
            {
                block.type === "image" ?
                    <div className='flex flex-col gap-4 items-center w-full'>
                        <img className=' rounded-lg' src={block.data.file.url} alt='' />
                        {block.data.caption && <p className='font-extralight text-gray-500 '><i>{block.data.caption}</i></p>}
                    </div>
                    : ""
            }
            {
                block.type === "list" ?
                    <List style={block.data.style} items={block.data.items} />

                    : ""
            }
            {
                block.type === 'quote' ?
                    <Quote quote={block.data.text} caption={block.data.caption} />
                    : ""
            }
            {
                block.type === 'embed' ?
                    <Embed embed={block.data.embed} source={block.data.source} />
                    : ""
            }
            {
                block.type === 'table' ?
                    <Table content={block.data.content} />

                    : ""
            }
        </div>
    )
}

const Table: React.FC<any> = ({ content }) => {
    return (
        <div className='px-10'>
            <table className="min-w-full border-4 rounded-lg border-gray-800 bg-white shadow-md" >
                <tbody>
                    {content.map((row: string[], index: number) => (
                        <tr key={index} className={`hover:bg-gray-100 hover:text-black hover:border-4 hover:border-black transition-colors duration-300 text-gray-600 `}>
                            {row.map((data: string, i: number) => (
                                <td className={`border-2 border-gray-800 p-4 `} dangerouslySetInnerHTML={{ __html: data }} key={i}>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const Embed: React.FC<any> = ({ embed, source }) => {
    return (
        <div className="flex flex-col items-center">
            <iframe
                src={embed}
                className='aspect-video h-full w-full'
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
            <a href={source} target="_blank" rel="noopener noreferrer" className="flex justify-center mt-4 text-gray-800 px-3 py-1.5 rounded-full bg-[#f2f2f2]">
                <FaLink className='transition-transform duration-500 ease-in-out transform hover:rotate-180' />
            </a>
        </div>
    )
}

const List: React.FC<any> = ({ style, items }) => {
    return (
        <div className='mx-10'>
            <ul className={`${style === 'unordered' ? "list-disc" : "list-decimal"} list-inside`}>
                {
                    items.length && items.map((d: string, i: number) => {
                        return <li key={i} className='font-gelasio my-4 leading-7' dangerouslySetInnerHTML={{ __html: d }}></li>
                    })
                }
            </ul>
        </div>
    )
}

const Quote: React.FC<any> = ({ quote, caption }) => {
    const [isActive, setIsActive] = useState(false);
    const handleClick = () => {
        setIsActive(!isActive);
    };
    return (
        <div className={`flex flex-col items-center border-l-4  border-purple-500 ${isActive ? 'animate-gradient-text' : 'bg-purple-100'} py-10 md:mx-10 max-md:px-5 leading-8`} onClick={handleClick}>
            <p className='italic font-medium' dangerouslySetInnerHTML={{ __html: quote.split("—")[0] }}>

            </p>
            <p className='italic font-medium text-gray-700' dangerouslySetInnerHTML={{ __html: "-" + quote.split("—")[1] }}>

            </p>
            {caption && <p className='font-extralight text-gray-500 mt-4'><i>{caption}</i></p>}
        </div>
    )
}


export default BlogContent
