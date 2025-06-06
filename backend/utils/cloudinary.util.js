import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


const extensionToResourceType = {
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', bmp: 'image', tiff: 'image', svg: 'image',
    mp4: 'video', mov: 'video', avi: 'video', flv: 'video', mkv: 'video', webm: 'video', mpeg: 'video',
    pdf: 'raw', txt: 'raw', doc: 'raw', docx: 'raw', xls: 'raw', xlsx: 'raw', csv: 'raw', zip: 'raw', rar: 'raw'
};

// Configuration
// cloudinary.config({
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME
// });

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
    console.log("Trying to delete", publicId, "...")
    const ext = publicId.split(".")[1].toLowerCase();
    const resourceType = extensionToResourceType[ext] || 'image';
    console.log(resourceType);
    cloudinary.uploader
    .destroy(
        publicId.split(".")[0],
        {
            resource_type: resourceType,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            invalidate:true
            
        }
    ).then(response => {
        console.log(response);
    })
        .catch(error => {
            console.log(error);
        })
}

export { uploadOnCloudinary, deleteFile }