import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

// Configuration
cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;
    try {
        const response = await cloudinary.uploader
            .upload(
                localFilePath, {
                resource_type: 'auto',
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME
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
    console.log("Trying to delete", publicId,"...")
    cloudinary.uploader.destroy(
        publicId.split(".")[0],
        {
            resource_type: "image",
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME
        }
    ).then(response => {
        console.log(response);
        return response;
    })
        .catch(error => {
            console.log(error);
        })
}

export { uploadOnCloudinary, deleteFile }