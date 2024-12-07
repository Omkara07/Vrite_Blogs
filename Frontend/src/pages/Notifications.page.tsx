import React, { createContext, useContext, useEffect, useState } from 'react'
import PageAnimation from '../common/page-animation';
import axios from 'axios';
import { AuthContext } from '../App';
import { filterPaginationData } from '../components/FilterPagination.component';
import { MutatingDots } from 'react-loader-spinner';
import NotificationCard from '../components/NotificationCard.component';
import NoData from '../components/NoData.component';
import LoadMoreDataBtn from '../components/LoadMoreDataBtn.component';

type NotificationsType = {
    results: any[]
    page: number,
    totalBlogs: number,
    deletedDocs: number
}

export const NotificationContext = createContext<any>({})
const Notifications = () => {
    const [filter, setFilter] = useState<string>("all");
    const filters = ['all', 'like', 'comment', 'reply'];
    const [notifications, setNotifications] = useState<NotificationsType | null>(null)
    const { userAuth, setUserAuth, userAuth: { token, new_notifications } } = useContext(AuthContext)

    const fecthNotifications = ({ page, deletedDocs = 0 }: { page: number, deletedDocs?: number }) => {
        axios.post(import.meta.env.VITE_server_url + '/user/notifications', {
            filter,
            page,
            deletedDocs
        }, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(async ({ data: { notifications: data } }) => {
                const formatedData = await filterPaginationData({
                    state: notifications,
                    data,
                    counteRoute: '/user/all-notifications-count',
                    token,
                    page,
                    data_to_send: { filter }
                })
                setUserAuth({ ...userAuth, new_notifications: false })
                setNotifications({ ...formatedData, deletedDocs })
            })
            .catch((e) => {
                console.log(e)
            })
    }

    const handleFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
        const ev = e.target as HTMLButtonElement;
        setFilter(ev.innerHTML);
        setNotifications(null)
    }

    useEffect(() => {
        if (token) {
            fecthNotifications({ page: 1 })
        }
    }, [token, filter])
    return (
        <PageAnimation>
            <div className='flex flex-col max-md:gap-16 md:gap-4 md:mx-8'>

                <h1 className='max-md:hidden font-semibold text-xl text-gray-600 md:-mb-5'>Recent Notifications</h1>
                <div className='max-md:mx-3 -my-8 md:my-8 flex gap-5'>
                    {
                        filters.map((filtername, i) => {
                            return (
                                <button key={i} className={`py-1.5 px-4 font-semibold text-sm rounded-full capitalize ${filtername === filter ? "bg-black text-white hover:bg-gray-700" : "bg-[#f2f2f2] text-black hover:bg-gray-300"} duration-300`} onClick={handleFilter}>
                                    {filtername}
                                </button>
                            )
                        })
                    }
                </div >
                <div>
                    {
                        notifications === null ? <div className='flex items-center max-md:justify-center md:ml-60 mt-32'>
                            <MutatingDots
                                visible={true}
                                height="100"
                                width="100"
                                color="black"
                                secondaryColor="black"
                                radius="12.5"
                                ariaLabel="mutating-dots-loading"
                                wrapperStyle={{}}
                                wrapperClass=""
                            />
                        </div> :
                            <div className='flex flex-col gap-2 md:w-[60%] w-full'>{
                                notifications.results.length ?
                                    notifications.results.map((notification, i) => {
                                        return <PageAnimation key={i} transition={{ delay: i * 0.1 }}>
                                            <NotificationContext.Provider value={{ notifications, setNotifications }}>
                                                <NotificationCard notification={notification} index={i} />
                                            </NotificationContext.Provider>
                                        </PageAnimation>
                                    })
                                    : <NoData message='Nothing Available' />

                            }
                                <LoadMoreDataBtn state={notifications} fetchDataFunc={fecthNotifications} additionalParams={{ deletedDocs: notifications.deletedDocs }} />
                            </div>
                    }
                </div>
            </div>
        </PageAnimation >
    )
}

export default Notifications
