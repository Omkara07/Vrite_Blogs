import express, { Request, Response } from "express";
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import User from '../Schemas/User'
import dotenv from 'dotenv'
import { GetUserMiddleware } from "../middlewares/Getuser";
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import * as admin from 'firebase-admin'
import * as serviceAccount from '../../blog-app-dd1ff-firebase-adminsdk-zulwp-181549e0ad.json'
import aws from "aws-sdk";

dotenv.config()

const router = express.Router()

const JWT_SECRET: string = process.env.JWT_SECRET || ""

const UserSignupSchema = z.object({
    fullname: z.string().min(2, { message: "name has to be minimum of length 2" }),
    email: z.string().email({ message: "Email format is invalid" }),
    password: z.string().min(8, { message: "password must be of atleast 8 length" })
})

const UserSigninSchema = z.object({
    email: z.string().email({ message: "Email format is invalid" }),
    password: z.string().min(8, { message: "password must be of atleast 8 length" })
})

const s3 = new aws.S3({
    region: "eu-north-1",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const generateUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket: "vrite-blog",
        Key: imageName,
        Expires: 1000,
        ContentType: "image/jpeg"
    })
}

export type userSignupType = z.infer<typeof UserSignupSchema>
export type userSigninType = z.infer<typeof UserSigninSchema>

// firebase connection
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

const generateUsername = async<T>(email: string) => {

    let username = email.split("@")[0]
    const isUsernameUnique = await User.findOne({ "personal_info.username": username })

    username += isUsernameUnique ? nanoid().substring(0, 5) : ""

    return username
}

export type ResponseUserType = {
    email: string
    username: string
    profile_img: string
    token: string
}

// upload image url route
router.get('/get-upload-url', async (req, res) => {
    generateUploadURL().then(url => res.json({ uploadURL: url }))
        .catch(err => {
            console.log(err.message)
            return res.status(500).json({ message: err.message })
        })
})


router.post('/signup', async (req: Request, res: Response) => {
    const result = UserSignupSchema.safeParse(req.body)
    if (!result.success) {
        res.status(400).json({
            message: result.error,
            success: false
        })
        return
    }
    const { fullname, email, password } = req.body

    const u = await User.findOne({ "personal_info.email": email });

    if (u) {
        res.status(411).json({
            message: "User Already Exist",
            success: false
        })
        return
    }
    else {
        bcrypt.hash(password, 11, async (err, hashpass) => {
            if (err) {
                return res.status(404).json({ error: err, success: false })
            }
            try {
                const username = await generateUsername<string>(email)
                const user = await User.create({ personal_info: { fullname, username, password: hashpass, email } })
                const token = jwt.sign({ id: user._id }, JWT_SECRET)
                const resUser: ResponseUserType = {
                    email,
                    username,
                    profile_img: user.personal_info?.profile_img || "",
                    token
                }
                res.json({
                    message: "user created successfully",
                    success: true,
                    user: resUser
                })
            }
            catch (err) {
                res.status(400).json({
                    message: err,
                    success: false
                })
            }
        })
    }
})


router.post('/signin', async (req: Request, res: Response) => {
    const result = UserSigninSchema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            error: result.error,
            success: false
        })
    }
    const { email, password } = req.body

    const u = await User.findOne({ "personal_info.email": email });

    if (!u) {
        res.status(411).json({
            message: "User Doesn't Exist",
            success: false
        })
    }
    else {
        bcrypt.compare(password, u?.personal_info?.password || "", (err, result) => {
            if (err) {
                res.status(403).json({ message: "Some error while loggin in, Please try again later", success: false })
            }

            if (!result) {
                res.status(403).json({ message: "Incorrect password", success: false })
            }
            else {
                const token = jwt.sign({ id: u._id }, JWT_SECRET)
                const resUser: ResponseUserType = {
                    email,
                    username: u.personal_info?.username || "",
                    profile_img: u.personal_info?.profile_img || "",
                    token
                }
                res.json({
                    message: "Logged in successfully",
                    success: true,
                    user: resUser
                })
            }
        })
    }
})

router.post('/googleAuth', async (req: Request, res: Response) => {
    console.log("start")
    try {
        console.log("hehe")
        let { email, fullname, photoURL } = req.body
        console.log(email, fullname, photoURL)

        // photoURL = photoURL?.replace("s96-c", "s384-c")

        console.log("line1")
        const user = await User.findOne({ 'personal_info.email': email })
        if (user) {
            if (!user.google_auth) {
                return res.status(403).json({
                    message: "Account was created using password. Try loggin in with password"
                })
            }

            // User exists and has Google auth enabled, you can return a success response here
            console.log("line2")
            const token = jwt.sign({ id: user._id }, JWT_SECRET);
            const resUser: ResponseUserType = {
                email: user.personal_info?.email || "",
                username: user.personal_info?.username || "",
                profile_img: user.personal_info?.profile_img || "",
                token
            };
            return res.json({
                message: "Logged in successfully",
                success: true,
                user: resUser
            });
        }
        else {
            console.log("line3")
            let username = await generateUsername<string>(email as string)

            const user = await User.create({
                personal_info: { fullname, email, username, profile_img: photoURL },
                google_auth: true
            })
            if (!user) {
                return res.status(500).json({ message: "Error Logging in with Google", success: false })
            }

            console.log("line4")
            const token = jwt.sign({ id: user._id }, JWT_SECRET)
            const resUser: ResponseUserType = {
                email: email as string,
                username: user.personal_info?.username || "",
                profile_img: user.personal_info?.profile_img as string,
                token
            }
            return res.json({
                message: "Logged in successfully",
                success: true,
                user: resUser
            })
        }
    }

    catch (e) {
        console.log("line5", e)
        res.status(403).json({
            message: "Error Login in",
            success: false
        })
    }

})

router.get('/getuser', GetUserMiddleware, async (req: Request, res: Response) => {
    const { id } = req.body

    try {
        const u = await User.findOne({ _id: id })

        if (!u) {
            res.status(401).json({ message: "Unauthorised User" })
        }
        res.json({ user: u })
    }
    catch (e) {
        res.status(401).json({ message: "error happened", error: e })
    }
})

export default router