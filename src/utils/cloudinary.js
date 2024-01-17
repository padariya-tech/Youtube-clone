import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed 
        return null;
    }
}

const deleteOnCloudinary = async (url)=>{

    const[_,cloudName,type,version,publicId,format]=url.match(/^http:\/\/res\.cloudinary\.com\/([^/]+)\/([^/]+)\/upload\/v(\d+)\/([^/]+)\.([^/]+)$/)
    console.log(type);
    console.log(publicId);
    try{
        if(!url) return null;
        const response = await cloudinary.uploader.destroy(
            publicId,
            {resource_type:`${type}`}
        )
        return response;
    }
    catch(error)
    {
        return null;
    }
}

export {uploadOnCloudinary,deleteOnCloudinary}

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });