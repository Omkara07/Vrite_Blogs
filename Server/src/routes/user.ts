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
import Blog from "../Schemas/Blog";

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

type paramType = {
    filter: string,
    page: number
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

    try {
        let { email, fullname, photoURL } = req.body

        // photoURL = photoURL?.replace("s96-c", "s384-c")

        const user = await User.findOne({ 'personal_info.email': email })
        if (user) {
            if (!user.google_auth) {
                return res.status(403).json({
                    message: "Account was created using password. Try loggin in with password"
                })
            }

            // User exists and has Google auth enabled, you can return a success response here

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
            let username = await generateUsername<string>(email as string)

            const user = await User.create({
                personal_info: { fullname, email, username, profile_img: photoURL },
                google_auth: true
            })
            if (!user) {
                return res.status(500).json({ message: "Error Logging in with Google", success: false })
            }

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

router.get("/latest-blogs", GetUserMiddleware, (req: Request, res: Response) => {
    let maxLimit = 5;
    const filter: string = req.query.filter as string
    const page: number = parseInt(req.query.page as string)
    const id: string = req.query.id as string
    let filterOb: any = { draft: false }
    console.log(filter, id)

    if (filter && filter !== "home") {
        filterOb = { draft: false, "tags": { $in: filter } }
    }
    if (id) {
        filterOb = { draft: false, author: id }
    }
    Blog.find(filterOb)
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ publishedAt: -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then((data) => {
            return res.json({
                success: true,
                blogs: data
            })
        })
        .catch((err: any) => {
            return res.status(500).json({ message: err })
        })
})

router.get("/all-latest-blogs-count", (req: Request, res: Response) => {
    const filter: string = req.query.filter as string
    const id: string = req.query.id as string
    let filterOb: any = { draft: false }
    if (filter && filter !== "home") {
        filterOb = { draft: false, "tags": { $in: filter } }
    }
    if (id) {
        filterOb = { draft: false, author: id }
    }
    Blog.countDocuments(filterOb)
        .then(count => {
            return res.json({ success: true, totalDocs: count })
        })
        .catch((err) => {
            res.status(500).json({ message: err.message })
        })
})

router.get("/all-search-blogs-count", (req: Request, res: Response) => {
    const filter: string = req.query.filter as string

    Blog.countDocuments({
        draft: false,
        // logical or operator works on an array of elements 
        $or: [{
            title: {
                // regex to match the patterns 
                "$regex": filter
            }
        }, {
            des: {
                "$regex": filter
            }
        }, {
            tags: {
                "$regex": filter
            }
        }]
    })
        .then(count => {
            return res.json({ success: true, totalDocs: count })
        })
        .catch((err) => {
            res.status(500).json({ message: err.message })
        })
})

router.get("/getBlogs", GetUserMiddleware, async (req: Request, res: Response) => {
    let maxLimit = 5;
    const filter = req.query.filter || "";
    const page: number = parseInt(req.query.page as string)
    if (!filter) {
        return res.json({
            blogs: []
        })
    }

    const blogs = await Blog.find({
        draft: false,
        // logical or operator works on an array of elements 
        $or: [{
            title: {
                // regex to match the patterns 
                "$regex": filter
            }
        }, {
            des: {
                "$regex": filter
            }
        }, {
            tags: {
                "$regex": filter
            }
        }]
    })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ publishedAt: -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then((data) => {
            return res.json({
                success: true,
                blogs: data
            })
        })
        .catch((err: any) => {
            return res.status(500).json({ message: err })
        })
})

router.get("/getAuthors", GetUserMiddleware, async (req: Request, res: Response) => {
    const filter = req.query.filter || "";
    if (!filter) {
        return res.json({
            users: null
        })
    }
    User.find({
        $or: [
            {
                "personal_info.username": { $regex: filter }
            },
            {
                "personal_info.fullname": { $regex: filter }
            }
        ]
    })
        .sort({ "personal_info.username": -1 })
        .select("personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .then(users => {
            res.json({ success: true, users })
        })
        .catch((err) => {
            res.status(500).json({ message: err.message })
        })

})

router.post("/get-profile", (req: Request, res: Response) => {
    const { username } = req.body
    User.findOne({ "personal_info.username": username })
        .select("-personal_info.password -google_auth -updatedAt -blogs")
        .then(user => {
            res.json(user)
        })
        .catch(e => {
            res.status(500).json({ message: e.message })
        })
})

router.post("/getBlog", (req: Request, res: Response) => {
    let incrementVal = 1;
    const { blog_id } = req.body
    Blog.findOneAndUpdate({
        blog_id
    }, {
        $inc: { "activity.total_reads": incrementVal }
    })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .select("blog_id title des banner content comments activity tags publishedAt -_id")
        .then((data) => {
            return res.json({
                success: true,
                blog: data
            })
        })
        .catch((err: any) => {
            return res.status(500).json({ message: err })
        })
})

router.get("/trending-blogs", GetUserMiddleware, (req: Request, res: Response) => {
    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "activity.total_read": -1, "activity.total_likes": -1, publishedAt: -1 })
        .select("blog_id title publishedAt -_id")
        .limit(5)
        .then((data) => {
            return res.json({
                success: true,
                blogs: data
            })
        })
        .catch((err) => {
            return res.status(500).json({ message: err })
        })
})


router.post('/create-blog', GetUserMiddleware, async (req: Request, res: Response) => {
    let { id, title, des, banner, content, tags, draft } = req.body

    if (!title.length) {
        return res.status(403).json({
            success: false,
            message: "Title can't be empty!"
        })
    }
    if (!draft) {
        if (!des.length || des.length > 200) {
            return res.status(403).json({
                success: false,
                message: "Blog Description is invalid"
            })
        }
        if (!banner.length) {
            return res.status(403).json({
                success: false,
                message: "Can't publish blog without a Banner"
            })
        }
        if (!content.blocks.length) {
            return res.status(403).json({
                success: false,
                message: "Can't publish blog without anything in it."
            })
        }
        if (!tags.length || tags.length > 8) {
            return res.status(403).json({
                success: false,
                message: "Can't publish blog with invalid tags"
            })
        }
    }
    // make all the tags lowercase 
    tags = tags.map((t: string) => t.toLowerCase())

    // Generate Blog_id
    let blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, '-').trim() + nanoid()

    try {
        const blog = await Blog.create({
            blog_id, title, des, banner, content, tags, draft: draft || false, author: id
        })
        const user = await User.findOneAndUpdate({ _id: id },
            {
                $inc: { "account_info.total_posts": draft ? 0 : 1 },
                $push: { "blogs": blog._id }
            }
        )
        return res.status(200).json({
            success: true,
            message: "Blog created successfully",
            blog,
            user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            message: "Error creating blog",
        })
    }
})

export default router