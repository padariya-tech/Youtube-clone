import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteOnCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const queryObj = {}


    

    if (query) {
        queryObj.title = { $regex: query, $options: "i" }
    }

    const sortObj = {};

    if(sortBy)
    {
        sortObj[sortBy] = sortType === 'desc' ? -1 : 1;
    }
   
    try { let videos;
        if(userId){
            videos = await Video
            .find({ owner: userId, ...queryObj })  // Include queryObj in the find condition
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit);
        }
        else
        {
            videos = await Video
                .find(queryObj)  // Include queryObj in the find condition
                .sort(sortObj)
                .skip((page - 1) * limit)
                .limit(limit);
        }

        return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching videos")
    }


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(
        [title,description].some((field)=>field?.trim()===""))
    {
        throw new ApiError(400,"All fields are required")
    }
    
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    console.log(videoFileLocalPath);

    if(!videoFileLocalPath || !thumbnailLocalPath)
    {
        throw new ApiError(400,"video and thumbnail is required")
    }
    console.log("reach here3");
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    console.log("reach here4");
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
console.log("reach here5");
    if(!videoFile || !thumbnail)
    {
        throw new ApiError(400,"video and thumbnail is required")
    }

   

    const video = await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        owner:req.user._id, // user id
        title,
        description,
        duration:videoFile.duration,
        views:0,
        isPublished:true
    })

    const createdVideo = await Video.findById(video._id)

    if(!createdVideo)
    {
        throw new ApiError(500,"Something went wrong while creating video")
    }

    return res.status(201).json(new ApiResponse(200,createdVideo,"Video created successfully"))
}) 

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    //TODO: get video by id
    if(!videoId || !videoId.trim())
    {
        throw new ApiError(400,"video id is required")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } }, // Increment viewCount by 1
        { new: true } // Return the updated document
    );
    // const delVideo = await Video.findById(videoId)
   
    
    if(!video)
    {
        throw new ApiError(404,"Video not found")
    }
    return res.status(220).json(new ApiResponse(220,video,"Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
      const { title, description } = req.body;
      if (!videoId || !videoId.trim()) {
        throw new ApiError(400, "Video ID is required");
    }

  

    const thumbnailLocalPath = req.file?.path;
    console.log(thumbnailLocalPath);
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url) {
        throw new ApiError(400, "Something went wrong while uploading thumbnail");
    }

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    // console.log(thumbnail.url);
    console.log(title);
    console.log(description);

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,  // Uncomment this line to update the title
                description,  // Uncomment this line to update the description
                thumbnail: thumbnail.url
            }
        },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId?.trim())
    {
        throw new ApiError(400,"video id is required")
    }
    //TODO: delete video
    const video = await Video.findById(videoId)
    console.log(video.videoFile);
    const vid = await deleteOnCloudinary(video.videoFile)
    const thumb = await deleteOnCloudinary(video.thumbnail)
    const delvid = await Video.findByIdAndDelete(videoId)

    if(!delvid)
    {
        throw new ApiError(404,"Video not found or already deleted")
    }

    
    if(!vid)
    {
        throw new ApiError(404,"Video not found")
    }
    return res.status(200).json(new ApiResponse(200,video,"Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;


    // Fetch the current video details from the database
    const currentVideo = await Video.findById(videoId);

    if (!currentVideo) {
        throw new ApiError(404, "Video not found");
    }

    // Invert the isPublished field
    const updatedIsPublished = !currentVideo.isPublished;

    // Update the video in the database with the inverted isPublished value
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: updatedIsPublished
            }
        },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, video, "Video published status changed"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
