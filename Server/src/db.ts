import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config();
export const ConnectDB = async () : Promise<void> =>{
    try{
        await mongoose.connect(process.env.mongoDB_URI || "")
        console.log("DB connected successfully")
    }
    catch(err){
        console.log(err)
        process.exit(1)
    }
}

