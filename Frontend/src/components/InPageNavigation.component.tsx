import React, { useEffect, useRef } from 'react'
import PageAnimation from '../common/page-animation';


type props = {
    routes: string[],
    inPageNavIndex?: number,
    defaultHidden: string[],
    children: React.ReactNode
}
const InPageNavigation: React.FC<props> = ({ routes, defaultHidden, inPageNavIndex = 0, children }) => {
    const activeTabLineRef = useRef<HTMLHRElement | null>(null);
    const activeTabRef = useRef<HTMLButtonElement | null>(null)
    const [activeRoute, setActiveRoute] = React.useState<number>(0)

    const handleRouteClick = (btn: HTMLButtonElement, i: number) => {
        const { offsetWidth, offsetLeft } = btn;
        if (activeTabLineRef.current) {
            activeTabLineRef.current.style.width = `${offsetWidth}px`
            activeTabLineRef.current.style.left = `${offsetLeft}px`
        }
        setActiveRoute(i)
    }

    useEffect(() => {
        handleRouteClick(activeTabRef.current as HTMLButtonElement, inPageNavIndex,)
    }, [])
    return (
        <PageAnimation>
            <div className='relative flex flex-nowrap overflow-x-auto mb-10 border-b border-gray-200  '>

                {routes.map((route: string, i: number) => {
                    return (
                        <button ref={i === inPageNavIndex ? activeTabRef : null} key={i} className={`p-4 px-10 capitalize font-semibold hover:text-black transition duration-500  ${activeRoute === i ? "text-black " : "text-gray-400"} ${defaultHidden.includes(route) ? "md:hidden" : ""}`}
                            onClick={(e) => handleRouteClick(e.target as HTMLButtonElement, i)}
                        >

                            {route}
                        </button>
                    )
                })}
                <hr ref={activeTabLineRef} className='absolute bottom-0 duration-300 h-[2px] bg-gray-800' />
            </div>
            {
                Array.isArray(children) ? children[activeRoute] : children
            }
        </PageAnimation>
    )
}

export default InPageNavigation
