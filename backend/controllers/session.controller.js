import { nanoid } from "nanoid"
import {apiResponse} from '../utils/apiResponse.util.js'
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import {apiError} from '../utils/apiError.util.js'

const createSession=(req,res)=>{
    const sessionId=nanoid(10);
    const sessionURL=`${req.protocol}://${req.get('host')}/session/${sessionId}`;
    // console.log('I am here.')
    return res.json(
        new apiResponse(200,{sessionId,sessionURL},"Id generated.")
    )
}
const uploadFile=asyncHandler(async(req,res)=>{
    // console.log(process.env.CLOUDINARY_API_SECRET,process.env.CLOUDINARY_API_KEY)
    const localFilePath=req.file?.path;
    const uploadedLink=await uploadOnCloudinary(localFilePath)
    if(!uploadedLink)
        throw new apiError(401,"File upload failed")
    const downloadLink=uploadedLink.secure_url.replace("upload/","upload/fl_attachment/")
    return res.status(202).json(
        new apiResponse(202,downloadLink,"File link generated successfully.")
    )
})
export {createSession,uploadFile}
