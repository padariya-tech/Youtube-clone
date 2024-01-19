import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!videoId || !videoId.trim())
    {
        throw new ApiError(400,"video id is required")
    }
    // const comments = await Comment.find({video:videoId}).limit(limit).skip(limit * (page - 1))
    // if(!comments)
    // {
    //     throw new ApiError(404,"No comments found")
    // }
    // return res.status(200).json(new ApiResponse(200,comments,"Comments fetched successfully"))

    const comments = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            createdAt:1,
                            avatar:1,
                        },
                    }
                ]
            },
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner",
                },
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "videoId",
                as: "likes"
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" }
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "videoId",
                as: "comments"
            }
        },
        {
            $addFields: {
                commentCount: { $size: "$comments" }
            }
        }
    ])

const options = {
    page: page,
    limit: limit
}
if(!comments)
{
    throw new ApiError(404,"No comments found")
}
return res.status(200).json(new ApiResponse(200,comments,options,"Comments fetched successfully"))
})
const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params
    if(!videoId || !videoId.trim())
    {
         throw new ApiError(400,"video id is required")
    }
    if(!content)
    {
        throw new ApiError(400,"content is required")
    }

    const comment = await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })
    if(!comment)
    {
        throw new ApiError(400,"Something went wrong while creating comment")
    }
    return res.status(201).json(new ApiResponse(201,comment,"Comment created successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body
    const {commentId} = req.params
    if(!content)
    {
        throw new ApiError(400,"All fields are required")
    }
    const comment = await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content
        }},
        {
            new:true
        }
    )
    if(!comment)
    {
        throw new ApiError(404,"Comment not found or error while updating")
    }
    return res.status(200).json(new ApiResponse(200,comment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    
    const comment = await Comment.findByIdAndDelete(commentId)
    
    if(!comment)
    {
        throw new ApiError(404,"Comment not found or error while deleting")
    }
    return res.status(200).json(new ApiResponse(200,comment,"Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
