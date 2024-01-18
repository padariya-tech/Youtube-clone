import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content)
    {
        throw new ApiError(400,"All fields are required")
    }
    const tweet= await Tweet.create({
        content,
        owner:req.user._id
    })
    if(!tweet)
    {
        throw new ApiError(400,"Something went wrong while creating tweet")
    }
    return res.status(201).json(new ApiResponse(201,tweet,"Tweet created successfully"))


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if(!userId || !isValidObjectId(userId))
    {
        throw new ApiError(400,"Invalid user id")
    }
    const tweets = await Tweet.find({owner:userId})
    if(!tweets)
    {
        throw new ApiError(404,"Tweets not found")
    }
    return res.status(200).json(new ApiResponse(200,tweets,"Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Invalid tweet id")
    }
    if(!content)
    {
        throw new ApiError(400,"All fields are required")
    }
    const tweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content
        }},
        {
            new:true
        }
    )
    if(!tweet)
    {
        throw new ApiError(404,"Tweet not found or error while updating")
    }
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Invalid tweet id")
    }
    const tweet = await Tweet.findByIdAndDelete(tweetId);
    if(!tweet)
    {
        throw new ApiError(404,"Tweet not found or already deleted")
    }
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
