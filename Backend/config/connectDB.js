import mongoose from "mongoose";

const connectDb = async ()=>{
    console.log(process.env.MONGO_URI);
    try{
        const connect = await mongoose.connect(process.env.MONGO_URI).then(
            ()=>console.log("mongodb connected successfully")

        )
    }catch(err){
        console.log(err);
    }
}

export default connectDb;