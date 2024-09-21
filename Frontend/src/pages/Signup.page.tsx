import React, { useContext, useState } from 'react'
import InputBox from '../components/InputBox.component'
import BlackBtn from '../components/blackBtn.component'
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom'
import PageAnimation from '../common/page-animation';
import { userSignupType } from '../../../Server/src/routes/user'
import axios from 'axios'
import { toast } from 'sonner';
import { AuthContext } from '../App';
import { authWithGoogle } from '../common/firebase';

const Signup = () => {
    const Server_url = import.meta.env.VITE_server_url
    const [creds, setCreds] = useState<userSignupType>({ fullname: "", email: "", password: "" })
    const navigate = useNavigate()
    const { setUserAuth } = useContext(AuthContext)

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        // let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
        if (creds.fullname.length < 2) {
            return toast("Fullname must have atleast 2 characters")
        }
        if (!emailRegex.test(creds.email)) {
            return toast.error("Invalid Email")
        }
        // if (!passwordRegex.test(creds.password)) {
        //     return toast.error("Invalid Password")
        // }
        if (creds.password.length < 8) {
            return toast.error("Password must be of minimum lenght 8")
        }

        try {
            const res = await axios.post(`${Server_url}/user/signup`, {
                fullname: creds.fullname,
                email: creds.email,
                password: creds.password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (res.data.success) {
                localStorage.setItem("userAuth", JSON.stringify(res.data.user))
                setUserAuth(res.data.user)
                toast.success(res.data.message)
                navigate('/')
            }
            else toast.error(res.data.message)
        }
        catch (e: any) {
            toast.error(e.response.data.message);
        }
    }

    const handleGoogleAuth = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        authWithGoogle().then(async (user: any) => {
            const access_token = user.accessToken
            console.log(access_token)
            console.log(user)
            try {
                // Make the API call to the server
                const res = await axios.post(`${Server_url}/user/googleAuth`, {
                    email: user.email,
                    fullname: user.displayName,
                    photoURL: user.photoURL
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
                        'Cross-Origin-Embedder-Policy': 'unsafe-none'
                    }
                });
                console.log(res.data)
                if (res.data.success) {
                    localStorage.setItem("userAuth", JSON.stringify(res.data.user))
                    setUserAuth(res.data.user)
                    toast.success(res.data.message)
                    navigate('/')
                }
                else toast.error(res.data.message)
            }
            catch (e: any) {
                toast.error(e.response.data.message);
            }
        })
            .catch(err => {
                toast.error("trouble login through google");
                return console.log(err)
            })
    }
    return (
        <PageAnimation>
            <div>
                <div className='flex flex-col w-full md:w-[40%] mx-auto justify-center items-center gap-6 mt-8  md:border border-gray-600 border-opacity-5 py-5 px-6 rounded-xl md:shadow-md'>
                    <h1 className='text-4xl font-bold mb-2'>Join Us Today</h1>
                    <InputBox type="text" placeholder="Name" value="" name="fullname" icon="fi-rr-user" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCreds({ ...creds, fullname: e.target.value })
                    }} />
                    <InputBox type="text" placeholder="Email" value="" name="email" icon="fi-rr-envelope" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCreds({ ...creds, email: e.target.value })
                    }} />
                    <InputBox type="password" placeholder="Password" value="" name="password" icon="fi-rr-key" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCreds({ ...creds, password: e.target.value })
                    }} />
                    <BlackBtn value='Create' onClick={handleSubmit} />
                    <div className='flex gap-1 text-gray-400 w-3/4 items-center'>
                        <hr className='flex w-1/2 ' />
                        <p className='flex'>OR</p>
                        <hr className='flex w-1/2 ' />
                    </div>
                    <div className='flex w-full justify-center items-center -translate-x-5 gap-1 md:gap-0'>
                        <FcGoogle className='relative translate-x-24 text-xl w-10 z-30 ' />
                        <BlackBtn value="Continue with Google" onClick={handleGoogleAuth} />
                    </div>
                    <div className='text-gray-500'>Already a User ? <Link to='/signin' className='underline text-black'>Login here</Link></div>
                </div>
            </div>
        </PageAnimation>
    )
}

export default Signup
