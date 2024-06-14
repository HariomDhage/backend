import {v2 as cloudinary} from 'cloudinary';
import { Console, log } from 'console';

import fs from 'fs';
import { CLIENT_RENEG_WINDOW } from 'tls';

 cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRETY // Click 'View Credentials' below to copy your API secret
 });


 const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        //upload the file on cloudinary
        const reponse = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded  successfully
        console.log("File has been uploaded on cloudinary!!",
            reponse.url);
            return reponse
    } catch (error) {
        fs.unlink(localFilePath)
        // remove the locally saved temporary files as the upload operation got failed
        return null;
        
    }
 }

 export {uploadOnCloudinary}