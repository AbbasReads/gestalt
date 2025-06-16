import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import dotenv from "dotenv"
dotenv.config();

const extensionToResourceType = {
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', bmp: 'image', tiff: 'image', svg: 'image',
    mp4: 'video', mov: 'video', avi: 'video', flv: 'video', mkv: 'video', webm: 'video', mpeg: 'video',
    pdf: 'raw', txt: 'raw', doc: 'raw', docx: 'raw', xls: 'raw', xlsx: 'raw', csv: 'raw', zip: 'raw', rar: 'raw'
};

// Configuration
cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
});

const uploadOnCloudinary = async (localFilePath, sessionId) => {
    if (!localFilePath) return null;
    try {
        const response = await cloudinary.uploader
            .upload(
                localFilePath, {
                folder: sessionId,
                resource_type: 'auto',
            }
            )
        // console.log('File uploaded successfully, ',response.url)
        fs.unlinkSync(localFilePath);
        return response;
    }
    catch (error) {
        fs.unlinkSync(localFilePath)
        console.log(error);
    }
};

const deleteFile = async (publicId) => {
    console.log("Trying to delete", publicId, "...")
    const ext = publicId.split(".")[1].toLowerCase();
    const resourceType = extensionToResourceType[ext] || 'image';
    console.log(resourceType);
    cloudinary.uploader
        .destroy(
            publicId.split(".")[0],
            {
                resource_type: resourceType,
                invalidate: true
            }
        ).then(response => {
            console.log(response);
        })
        .catch(error => {
            console.log(error);
        })
}
const deleteFolder=async(sessionId)=>{
    cloudinary.api.delete_resources_by_prefix(sessionId+"/")
    .catch(err=> console.log(err))
    
}

export { uploadOnCloudinary, deleteFile,deleteFolder }