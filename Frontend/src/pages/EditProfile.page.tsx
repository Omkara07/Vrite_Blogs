import { useContext, useEffect, useRef, useState } from 'react'
import { defaultUser, userType } from './ProfilePage.page'
import { AuthContext } from '../App';
import axios from 'axios';
import PageAnimation from '../common/page-animation';
import InputBox from '../components/InputBox.component';
import { faFacebook, faInstagram, faYoutube, faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons'; // Import specific icons
import uploadImage from '../common/aws';
import { toast } from 'sonner';
import { MutatingDots } from 'react-loader-spinner';
import UploadImageModal from '../components/UploadImageModal.component';

export let imgRef: React.MutableRefObject<HTMLImageElement | null>;

const EditProfile = () => {
    const [profile, setProfile] = useState<userType>(defaultUser)
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState(false)
    const { userAuth: { token, username }, userAuth, setUserAuth } = useContext(AuthContext);
    const bioLimit = 150;
    const [bioLen, setBioLen] = useState<number>(0);
    imgRef = useRef<HTMLImageElement>(null)
    const [updatedImg, setUpdatedImg] = useState<any>(null)
    let { personal_info: { username: profile_username, email, fullname, profile_img, bio }, social_links, joinedAt, _id } = profile

    // Mapping brand names to their respective FontAwesome icons
    const iconsMap: { [key: string]: any } = {
        twitter: faXTwitter,
        facebook: faFacebook,
        instagram: faInstagram,
        github: faGithub,
        youtube: faYoutube,
    };

    // account_info: { total_posts, total_reads }
    useEffect(() => {
        if (token) {
            setLoading(true)
            axios.post(import.meta.env.VITE_server_url + '/user/get-profile', {
                username
            })
                .then(async ({ data }) => {
                    setProfile(data)
                    console.log(data)
                    setLoading(false)
                })
        }
    }, [token])

    const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const eve = e.target as HTMLInputElement
        if (eve.files && eve.files.length && imgRef.current) {
            const img = eve.files[0];
            setUpdatedImg(img)
        }
    }

    const handleImgUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const eve = e.target as HTMLButtonElement
        const loadingToast = toast.loading("Uploading")
        eve.setAttribute("disabled", "true")
        console.log(updatedImg)
        if (updatedImg) {

            uploadImage({ img: updatedImg })
                .then(url => {
                    if (url) {
                        axios.post(import.meta.env.VITE_server_url + '/user/update-profile-img', { url }, {
                            headers: {
                                Authorization: "Bearer " + token
                            }
                        })
                            .then(({ data }) => {
                                let newUserAuth = { ...userAuth, profile_img: data.profile_img }
                                localStorage.setItem("userAuth", JSON.stringify(newUserAuth))
                                setUserAuth(newUserAuth);

                                setUpdatedImg(null);
                                toast.dismiss(loadingToast)
                                eve.removeAttribute("disabled")
                                toast.success("Uploaded")
                            })
                            .catch(({ response }) => {
                                toast.dismiss(loadingToast);
                                eve.removeAttribute("disabled")
                                console.log(response)
                                toast.error(response.data.message)
                            })
                    }
                })
        }
    }

    const handleProfileUpdate = (e: React.MouseEvent<HTMLButtonElement>) => {
        const eve = e.target as HTMLButtonElement
        const { personal_info: { username, bio }, social_links } = profile
        if (username.length < 3) {
            return toast.error("Username must be atleast 3 characters long")
        }
        if (bio.length > bioLimit) {
            return toast.error(`Bio must be less than ${bioLimit} characters`)
        }
        const loadingToast = toast.loading("Uploading...")
        eve.setAttribute("disabled", "true")
        axios.post(import.meta.env.VITE_server_url + '/user/update-profile', {
            username,
            bio,
            social_links
        }, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(({ data }) => {
                if (userAuth.username != data.username) {
                    let newUserAuth = { ...userAuth, username: data.username }
                    localStorage.setItem("userAuth", JSON.stringify(newUserAuth))
                    setUserAuth(newUserAuth)
                }
                toast.dismiss(loadingToast)
                eve.removeAttribute("disabled")
                toast.success("Updated")
            })
            .catch(({ response }) => {
                toast.dismiss(loadingToast);
                eve.removeAttribute("disabled")
                toast.error(response.data.message)
            })
    }
    return (
        <> {
            loading ? <div className='flex items-center justify-center mt-44'>
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
                <PageAnimation>
                    <UploadImageModal open={open} setOpen={setOpen} handleImgChange={handleImgChange} updatedImg={updatedImg} setUpdatedImg={setUpdatedImg} />

                    <h1 className='max-md:hidden text-xl font-semibold mb-10 text-gray-600'>Edit Profile</h1>
                    <div className='flex max-lg:flex-col md:gap-20 gap-5'>

                        <div className='flex flex-col max-lg:items-center gap-5 min-w-[250px] max-md:mx-auto md:items-center md:w-1/4'>
                            <label htmlFor="uploadImg" className='relative block w-48 h-48 bg-[#f2f2f2] rounded-full overflow-hidden'>
                                <button className='w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 font-semibold cursor-pointer' onClick={() => setOpen(true)}>
                                    Upload Image
                                </button>
                                <img ref={imgRef} src={profile_img} className='w-full h-full' />
                            </label>

                            <button className='px-4 py-2 rounded-full max-lg:center w-32 hover:bg-gray-700 bg-black text-white font-semibold' onClick={handleImgUpload}>Upload</button>
                        </div>
                        <div className='flex flex-col w-full gap-5'>
                            <div className='flex max-md:flex-col gap-5 md:w-[80%] w-full items-center'>
                                <InputBox type='text' value={fullname} wid='[80%]' name='fullname' placeholder='fullname' disabled={true} icon='fi-rr-user' />
                                <InputBox type='text' value={email} wid='[80%]' name='email' placeholder='email' disabled={true} icon='fi-rr-envelope' />
                            </div>
                            <div className='flex flex-col w-full max-md:items-center gap-5'>
                                <InputBox type='text' value={profile_username} wid='[80%]' name='username' placeholder='username' icon='fi-rr-at' onChange={(e) => {
                                    setProfile(prev => ({
                                        ...prev,
                                        personal_info: {
                                            ...prev.personal_info,  // corrected typo here
                                            username: e.target.value
                                        }
                                    }))
                                }} />
                                <p className='flex text-[11px] text-gray-400 -mt-4 max-sm:pl-2'>Username will be used to search user and will be visible to all.</p>
                                <textarea maxLength={200} defaultValue={bio} onChange={(e) => {
                                    setBioLen(e.target.value.length)
                                    setProfile(prev => ({
                                        ...prev,
                                        personal_info: {
                                            ...prev.personal_info,  // corrected typo here
                                            bio: e.target.value
                                        }
                                    }))
                                }} className='w-[80%] h-40 rounded-xl bg-[#f2f2f2] resize-none px-4 leading-7 transition duration-300 ease-in-out focus:border focus:border-gray-400 focus:ring-2 focus:ring-gray-400' placeholder='Bio' />

                                <p className={`text-right -mt-4 md:mr-44 max-md:-ml-52 text-[12px] max-sm:pl-3 text-gray-400`}>{bioLen} / {bioLimit} Characters</p>

                                <p className='text-xl font-semibold text-gray-500'>Your Socials</p>

                                <div className='grid md:grid-cols-2 gap-y-5 md:w-[89%] w-full max-md:justify-items-center'>
                                    {
                                        Object.keys(social_links).map((key, i) => {
                                            const link = social_links[key];
                                            const icons = iconsMap[key.toLowerCase()];
                                            return (
                                                <InputBox wid='[80%]' key={i} name={key} fromEditPage={true} value={link} type='text' placeholder='https://' icon={icons}
                                                    onChange={(e) => {
                                                        setProfile(prevData => ({
                                                            ...prevData,
                                                            social_links: { ...prevData.social_links, [key]: e.target.value }
                                                        }));
                                                    }} />
                                            )
                                        })
                                    }
                                </div>
                                <button className='px-4 py-2 rounded-full max-lg:center font-semibold w-32 bg-black text-white hover:bg-gray-700' onClick={handleProfileUpdate}>Update</button>
                            </div>
                        </div>

                    </div>
                </PageAnimation >
        }
        </>
    )
}

export default EditProfile
