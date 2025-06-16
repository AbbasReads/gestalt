import { nanoid } from "nanoid"
import {apiResponse} from '../utils/apiResponse.util.js'
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import {apiError} from '../utils/apiError.util.js'
import { Session } from "../models/session.model.js";

const createSession = async () => {
  const sessionId = nanoid(10);
  const passcode = nanoid(4);
  const sessionURL = `http://localhost:5173/session/${sessionId}/${passcode}`;
  await Session.create({ sessionId }); 
  return { sessionId, sessionURL, passcode };
}

const uploadFile=asyncHandler(async(req,res)=>{
    // console.log(process.env.CLOUDINARY_API_SECRET,process.env.CLOUDINARY_API_KEY)
    const localFilePath=req.file?.path;
    const uploadedLink=await uploadOnCloudinary(localFilePath,req.body.sessionId)
    if(!uploadedLink)
        return res.status(402).json(
            new apiResponse(402,{},"File upload failed")
    ) 
    const downloadLink=uploadedLink.secure_url.replace("upload/","upload/fl_attachment/")
    return res.status(202).json(
        new apiResponse(202,downloadLink,"File link generated successfully.")
    )
})
export {createSession,uploadFile}
