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
import Notification from "../Schemas/Notification";
import Comment from "../Schemas/Comment";
import { Types } from "mongoose";

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

router.post("/all-latest-blogs-count", (req: Request, res: Response) => {
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

router.post("/all-search-blogs-count", (req: Request, res: Response) => {
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

router.post("/getBlogs", GetUserMiddleware, async (req: Request, res: Response) => {
    let maxLimit = 5;
    const filter = req.query.filter || "";
    const page: number = parseInt(req.query.page as string)
    const tags: string[] = req.body.tags
    const eliminate_blog = req.query.eliminate_blog as string
    let filterOb: any = { draft: false }
    if (!filter && !tags) {
        return res.json({
            blogs: []
        })
    }
    if (filter) {
        filterOb = {
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
        }
    }
    if (tags) {
        filterOb = { draft: false, tags: { $in: tags }, blog_id: { $ne: eliminate_blog } }
    }

    const blogs = await Blog.find(filterOb)
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

router.post("/getBlog", async (req: Request, res: Response) => {
    const { blog_id, draft, isEdit } = req.body
    let incrementVal = isEdit ? 0 : 1;
    try {

        const data = await Blog.findOneAndUpdate({
            blog_id
        }, {
            $inc: { "activity.total_reads": incrementVal }
        })
            .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
            .select("blog_id title des banner content comments activity tags publishedAt -_id")

        if (!data) {
            res.status(404).json({ success: false, message: "Blog not found" })
        }
        else {
            // @ts-ignore
            const username = data?.author?.personal_info?.username;
            if (username) {
                User.findOneAndUpdate({ "personal_info.username": username }, {
                    $inc: { "account_info.total_reads": incrementVal }
                })
                    .catch((e) => {
                        res.status(500).json({ message: e })
                    })

            }
            if (data.draft && !draft) {
                return res.status(500).json({ message: "Can't access draft blog" })
            }
            return res.json({
                success: true,
                blog: data
            })
        }
    }
    catch (err: any) {
        return res.status(500).json({ message: err })
    }
})

router.post("/like-blog", GetUserMiddleware, (req: Request, res: Response) => {
    const { blog_id, isLiked, id } = req.body

    const incrementcnt = !isLiked ? 1 : -1;
    Blog.findOneAndUpdate({ blog_id }, {
        $inc: { "activity.total_likes": incrementcnt }
    })
        .then((blog) => {
            if (!isLiked) {
                Notification.create({
                    type: "like",
                    blog: blog?._id,
                    notification_for: blog?.author,
                    user: id
                })
                    .then((noti) => {
                        res.json({ message: "Blog liked successfully", success: true })
                    })
                    .catch((e) => {
                        res.status(500).json({ message: e, success: false })
                    })
            }
            else {
                Notification.findOneAndDelete({ type: 'like', blog: blog?._id, notification_for: blog?.author, user: id })
                    .then((noti) => {
                        res.json({ message: "Blog disliked successfully", success: true })
                    })
                    .catch((e) => {
                        res.status(500).json({ message: e, success: false })
                    })
            }
        })
        .catch((e) => {
            res.status(500).json({ message: e, success: false })
        })
})

router.post("/is-blog-liked", GetUserMiddleware, (req: Request, res: Response) => {
    const { blog_id, id } = req.body
    Blog.findOne({ blog_id }).then((blog) => {
        Notification.findOne({ blog: blog?._id, type: 'like', user: id })
            .then((result) => {
                res.json({ result })
            })
            .catch((e) => [
                res.status(500).json({ message: e })
            ])
    })
        .catch((e) => {
            res.status(500).json({ message: e })
        })
})

router.post("/add-comment", GetUserMiddleware, async (req: Request, res: Response) => {
    let { blog_id, comment, replying_to, id, notification_id } = req.body
    console.log(replying_to)

    if (!comment.length) {
        return res.status(500).json({ message: "Can't post an empty comment" })
    }

    try {

        Blog.findOneAndUpdate({ blog_id }, {
            $inc: { "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1 }
        })
            .then(async (blog) => {
                if (!blog) {
                    return res.status(500).json({ message: "Something went wrong", success: false })
                }
                let commentObj = {
                    blog_id: blog?._id,
                    blog_author: blog?.author,
                    comment,
                    commented_by: id,
                    parent: null,
                    isReply: false
                }
                if (replying_to) {
                    commentObj.parent = replying_to
                    commentObj.isReply = true
                }
                Comment.create(commentObj)
                    .then(async (commentFile) => {
                        console.log(commentFile)
                        Blog.findOneAndUpdate({ blog_id },
                            {
                                $push: { "comments": commentFile._id },
                            }
                        )
                            .then((blog) => {
                                console.log("comment added to blog")
                            })
                        let notifiObj = {
                            type: replying_to ? 'reply' : 'comment',
                            blog: blog?._id,
                            user: id,
                            notification_for: blog?.author,
                            comment: commentFile._id,
                            replied_on_comment: null
                        }
                        if (replying_to) {
                            notifiObj.replied_on_comment = replying_to;
                            await Comment.findOneAndUpdate({ _id: replying_to },
                                {
                                    $push: { children: commentFile._id }
                                }
                            )
                                .then((replyingToCommentDoc) => {
                                    if (notifiObj) {
                                        notifiObj.notification_for = replyingToCommentDoc?.commented_by!
                                    }
                                })

                            if (notification_id) {
                                Notification.findOneAndUpdate({ _id: notification_id }, { reply: commentFile._id })
                                    .then((noti) => console.log("notification updated"))
                                    .catch((e) => console.log(e))
                            }
                        }
                        Notification.create(notifiObj)
                            .then((not) => {
                                console.log("notification for comment done")
                            })

                        return res.json({ comment: commentFile, success: true })
                    })
            })
    }
    catch (e) {
        res.status(500).json({ message: e, success: false })
    }

})

router.post("/get-blog-comments", async (req: Request, res: Response) => {
    const { blog_id, skip, id } = req.body
    let maxLimit = 5;
    const blog = await Blog.findOne({ blog_id })
    Comment.find({ blog_id: blog?._id, isReply: false })
        .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
        .skip(skip)
        .limit(maxLimit)
        .sort({
            'commentedAt': -1
        })
        .then(comment => {
            return res.json(comment);
        })
        .catch(err => {
            return res.status(500).json({ message: err, success: false })
        })
})

router.post("/get-replies", async (req: Request, res: Response) => {
    const { _id, skip } = req.body;
    const maxLimit = 5;
    Comment.findOne({ _id })
        .populate({
            path: "children",
            options: {
                limit: maxLimit,
                skip: skip,
                sort: { 'commentAt': -1 }
            },
            populate: {
                path: "commented_by",
                select: "personal_info.profile_img personal_info.fullname personal_info.username"
            },
            select: "-blog_id -updatedAt"
        })
        .select("children")
        .sort({ commentedAt: -1 })
        .then(doc => {
            return res.json({ replies: doc?.children });
        })
        .catch((e) => {
            return res.status(500).json({ message: e, success: false })
        })
})

const deleteComment = async (_id: Types.ObjectId) => {
    Comment.findOneAndDelete({ _id })
        .then(async (comment) => {
            if (comment?.parent) {
                Comment.findOneAndUpdate({ _id: comment.parent },
                    {
                        $pull: { children: _id }
                    }
                )
                    .then(data => console.log("comment Deleted"))
                    .catch(e => console.log(e))
            }
            await Notification.findOneAndDelete({ comment: _id }).then(not => console.log('comment notification deleted'))

            await Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } }).then(not => console.log('reply notification deleted'))

            Blog.findOneAndUpdate({ _id: comment?.blog_id }, {
                $pull: { comments: _id },
                $inc: { "activity.total_comments": -1, "activity.total_parent_comments": comment?.parent ? 0 : -1 }
            })
                .then(blog => {
                    if (comment?.children.length) {
                        comment.children.map((replies) => {
                            deleteComment(replies)
                        })
                    }
                })
        })
        .catch(e => {
            console.log("Something wrong has occured", e)
        })
}
router.post('/delete-comment', GetUserMiddleware, (req: Request, res: Response) => {
    const { id, _id } = req.body
    console.log(id, _id)
    Comment.findOne({ _id })
        .then(async (comment) => {
            console.log(comment)
            if (id == comment?.commented_by || id == comment?.blog_author) {
                await deleteComment(_id)
                return res.json({ success: true, message: "Deleted successfully" })
            }
            else {
                return res.status(403).json({ message: "You are not authorized to delete this comment", success: false })
            }
        })
})

router.post('/change-password', GetUserMiddleware, (req: Request, res: Response) => {
    const { curPassword, newPassword, id } = req.body
    User.findOne({ _id: id })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ message: "User not found", success: false })
            }
            if (user?.google_auth) {
                return res.status(403).json({ message: "User was loggedin using google, cannot change password" })
            }
            bcrypt.compare(curPassword, user?.personal_info?.password as string, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: err, success: false })
                }
                if (!result) {
                    return res.status(403).json({ message: "Incorrect Password", success: false });
                }
                bcrypt.hash(newPassword, 11, (err, hashedPassword) => {
                    if (err) {
                        return res.status(500).json({ message: err, success: false })
                    }
                    User.findOneAndUpdate({ _id: id }, {
                        "personal_info.password": hashedPassword
                    })
                        .then((u) => {
                            return res.json({ message: "Password changed successfully", success: true })
                        })
                        .catch((err) => {
                            return res.status(500).json({ message: err, success: false })
                        })
                })
            })
        })
        .catch(e => {
            return res.status(500).json({ message: 'something went wrong', success: false });
        })
})

router.post("/update-profile-img", GetUserMiddleware, (req: Request, res: Response) => {
    const { id, url } = req.body;
    User.findOneAndUpdate({ _id: id }, {
        "personal_info.profile_img": url
    })
        .then((data) => {
            return res.json({ profile_img: url })
        })
        .catch((e) => {
            return res.status(500).json({ message: "Something went wrong!", success: false })
        })
})

router.post("/update-profile", GetUserMiddleware, (req: Request, res: Response) => {
    const { id, username, bio, social_links } = req.body;
    const bioLimit = 150;
    if (bio.length > bioLimit) {
        return res.status(403).json({ message: `Bio must be atmost ${bioLimit} characters long.`, success: false });
    }
    if (username.length < 3) {
        return res.status(403).json({ message: "Username must be at least 3 characters long.", success: false })
    }
    let socialLinksArr = Object.keys(social_links)
    try {
        for (let i = 0; i < socialLinksArr.length; i++) {
            if (social_links[socialLinksArr[i]].length) {
                let hostname = new URL(social_links[socialLinksArr[i]]).hostname;
                console.log(hostname)
                if ((!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] != 'twitter') && socialLinksArr[i] !== 'website') {
                    return res.status(403).json({ message: `Invalid ${socialLinksArr[i]} link`, success: false });
                }
            }
        }
    }
    catch (e) {
        return res.status(500).json({ message: "You  have entered an invalid link.(Provide full links with http(s))", success: false })

    }
    let updatedObj = {
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links
    }
    User.findOneAndUpdate({ _id: id }, updatedObj, {
        // to deal with the duplicate usernames
        runValidators: true
    })
        .then(() => {
            return res.json({ username })
        })
        .catch((err) => {
            if (err.code == 11000) {
                return res.status(409).json({ message: "Username is already taken" })
            }
            else return res.status(500).json({ message: err.message })
        })
})

router.get('/new-notifications', GetUserMiddleware, (req: Request, res: Response) => {
    const { id } = req.body
    Notification.exists({ notification_for: id, seen: false, user: { $ne: id } })
        .then((result) => {
            if (result) {
                return res.json({ success: true, new_notifications: true })
            }
            else {
                return res.json({ message: false, new_notifications: false })
            }
        })
        .catch((e) => {
            return res.status(500).json({ message: e.message })

        })
})

router.post('/notifications', GetUserMiddleware, (req: Request, res: Response) => {
    const { id, filter, page, deletedDocs } = req.body

    const maxLimit = 10;
    let skipDocs = (page - 1) * maxLimit;
    let findQuery: any = { notification_for: id, user: { $ne: id } }
    if (filter !== 'all') {
        findQuery = { ...findQuery, type: filter }
    }
    if (deletedDocs) {
        skipDocs -= deletedDocs
    }

    Notification.find(findQuery)
        .skip(skipDocs)
        .limit(maxLimit)
        .populate("blog", "blog_id title")
        .populate("user", "personal_info.username personal_info.fullname personal_info.profile_img")
        .populate("comment", "comment")
        .populate("replied_on_comment", "comment")
        .populate("reply", "comment")
        .sort({ createdAt: -1 })
        .select("createdAt type seen reply")
        .then(async (notifications) => {
            await Notification.updateMany(findQuery, { seen: true })
                .skip(skipDocs)
                .limit(maxLimit)
            return res.json({ success: true, notifications: notifications })
        })
        .catch((e) => {
            return res.status(500).json({ message: e.message, success: false })
        })
})

router.post('/all-notifications-count', GetUserMiddleware, (req: Request, res: Response) => {
    const { id, filter } = req.body

    let findQuery: any = { notification_for: id, user: { $ne: id } }
    if (filter !== 'all') {
        findQuery = { ...findQuery, type: filter }
    }

    Notification.countDocuments(findQuery)
        .then((count) => {
            return res.json({ success: true, totalDocs: count })
        })
        .catch((e) => {
            return res.status(500).json({ message: e.message, success: false })
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
    let { id, title, des, banner, content, tags, draft, blogId } = req.body

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
    let blog_id = blogId || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, '-').trim() + nanoid()

    if (blogId) {
        Blog.findOneAndUpdate({ blog_id }, {
            title, des, banner, content, tags, draft: draft ? draft : false
        })
            .then(() => {
                res.json({ blog_id, success: true, message: "Blog updated successfully" })
            })
            .catch((e) => {
                res.status(500).json({ message: e, success: false })
            })
    }
    else {

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
    }
})

router.post('/written-blogs', GetUserMiddleware, (req: Request, res: Response) => {
    const { id, page, draft, query, deletedDocs } = req.body
    let maxLimit = 5;
    let skipDoc = (page - 1) * maxLimit;
    if (deletedDocs) {
        skipDoc -= deletedDocs
    }

    Blog.find({ author: id, draft, title: { "$regex": query } })
        .skip(skipDoc)
        .limit(maxLimit)
        .sort({ publishedAt: -1 })
        .select("title banner des draft publishedAt activity blog_id -_id")
        .then((blogs) => {
            return res.json({ blogs, success: true })
        })
        .catch((e) => {
            return res.status(500).json({ message: e.message, success: false })
        })
})

router.post('/written-blogs-count', GetUserMiddleware, (req: Request, res: Response) => {
    const { id, draft, query } = req.body
    Blog.countDocuments({ author: id, draft, title: { $regex: query } })
        .then((totalDocs) => {
            return res.json({ totalDocs, success: true })
        })
        .catch((e) => {
            return res.status(500).json({ message: e.message, success: false })
        })
})

router.post("/delete-blog", GetUserMiddleware, (req: Request, res: Response) => {
    const { id, blog_id } = req.body

    Blog.findOneAndDelete({ blog_id })
        .then((blog) => {
            if (blog) {
                const reads = blog.activity?.total_reads || 0;
                Notification.deleteMany({ blog: blog._id }).then(() => console.log("notifications deleted"))

                Comment.deleteMany({ blog_id: blog._id }).then(() => console.log("comments deleted"))

                User.findOneAndUpdate({ _id: id }, {
                    $pull: { blogs: blog._id },
                    $inc: { "account_info.total_posts": -1, "account_info.total_reads": -reads }
                })
                    .then(() => console.log("blog deleted"))

                return res.status(200).json({ message: "blog deleted", success: true })
            }
            else return res.status(500).json({ message: "something went wrong", success: false })
        })
        .catch((e) => {
            return res.status(500).json({ message: e.message, success: false })
        })
})

router.get('/hello', (req: Request, res: Response) => {
    return res.json({ message: "hello betch" })
})

export default router