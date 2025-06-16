import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import dotenv from "dotenv"
dotenv.config();

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

const deleteFolder = async (sessionId) => {
    cloudinary.api.delete_resources_by_prefix(sessionId + "/")
    .then(() => cloudinary.api.delete_folder(sessionId))
    .catch(err => console.log(err));
}

export { uploadOnCloudinary, deleteFolder }