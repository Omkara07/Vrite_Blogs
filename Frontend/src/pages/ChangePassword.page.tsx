import React, { useContext, useState } from 'react'
import InputBox from '../components/InputBox.component'
import BlackBtn from '../components/blackBtn.component'
import PageAnimation from '../common/page-animation'
import { toast } from 'sonner'
import axios from 'axios'
import { AuthContext } from '../App'

const ChangePassword = () => {
    const [curPassword, setCurPassword] = useState<string>('')
    const [newPassword, setNewPassword] = useState<string>('')
    const { userAuth: { token } } = useContext(AuthContext)

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const eve = e.target as HTMLButtonElement
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
        if (!curPassword.length || !newPassword.length) {
            return toast.error("Fill all the fields")
        }
        if (!passwordRegex.test(curPassword) || !passwordRegex.test(newPassword)) {
            return toast.error("Password must of minimum 6 length and contain at least 1 number, 1 uppercase and 1 lowercase letter")
        }

        eve.setAttribute('disabled', "true")
        let Uploading = toast.loading("Updating...")
        axios.post(import.meta.env.VITE_server_url + '/user/change-password', {
            curPassword,
            newPassword
        }, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(({ data }) => {
                eve.removeAttribute('disabled')
                toast.dismiss(Uploading)
                toast.success('Password changed successfully!')
                setCurPassword('')
                setNewPassword('')
            })
            .catch((err) => {
                eve.removeAttribute('disabled')
                toast.dismiss(Uploading)
                toast.error(err.response.data.message)
                setCurPassword('')
                setNewPassword('')
            })
    }
    return (
        <PageAnimation>
            <div>
                <div className='my-4 w-full md:max-w-[500px] flex flex-col gap-6 md:mx-20 max-md:items-center'>
                    <h1 className='font-bold text-xl items-center mb-5 max-md:hidden'>Change Password</h1>
                    <InputBox type='password' placeholder='Current Password' name='CurPassword' value={curPassword} onChange={(e) => setCurPassword(e.target.value)} icon='fi-rr-unlock' />
                    <InputBox type='password' placeholder='Current Password' name='NewPassword' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} icon='fi-rr-unlock' />
                    <BlackBtn value='Change Password' onClick={handleSubmit} />
                </div>
            </div>
        </PageAnimation>
    )
}

export default ChangePassword
