import mongoose from 'mongoose';
const { Schema } = mongoose;

const sessionSchema = new Schema({
    sessionId:String,
    messages:[
        {
            text:String,
            file:String,
            sentBy:String
        }
    ]
});

export const Session=mongoose.model("Session",sessionSchema)