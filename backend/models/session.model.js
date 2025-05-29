import mongoose, { mongo } from 'mongoose';
const { Schema } = mongoose;

const sessionSchema = new Schema({
    createdBy:String,
    sessionId:String,
    texts:[{
        text:String,
        sentBy:String
    }],
    files:[
        {
            link:String,
            sentBy:String
        }
    ]
});

export const sessionModel=mongoose.model("sessionModel",sessionSchema)