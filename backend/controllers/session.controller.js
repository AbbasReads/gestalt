import { nanoid } from "nanoid"
import {apiResponse} from '../utils/apiResponse.util.js'
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import {apiError} from '../utils/apiError.util.js'
import { Session } from "../models/session.model.js";

const createSession = asyncHandler(async (req, res) => {
  const sessionId = nanoid(10);
  const passcode = nanoid(4);
  const sessionURL = `${req.protocol}://${req.get('host')}/session/${sessionId}/${passcode}`;

  const doc=await Session.create({ sessionId }); 
  console.log(doc) // Wait for DB insert
  return res.status(200).json(
    new apiResponse(200, { sessionId, sessionURL, passcode }, "Id generated.")
  );
});

const uploadFile=asyncHandler(async(req,res)=>{
    // console.log(process.env.CLOUDINARY_API_SECRET,process.env.CLOUDINARY_API_KEY)
    const localFilePath=req.file?.path;
    const uploadedLink=await uploadOnCloudinary(localFilePath)
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
