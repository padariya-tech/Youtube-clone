import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId))
    {
        throw new ApiError(400,"Invalid channel id")
    }
    const subscription = await Subscription.findOne({channel:channelId})
    if(!subscription)
    {
        const sub = await Subscription.create({
            channel:channelId,
            subscriber:req.user._id
        })
        if(!sub)
        {
            throw new ApiError(400,"Error while subscribing")
        }
        return res.status(200).json(new ApiResponse(200,sub,"Subscribed successfully"))
    }
    else
    {
        const del = await Subscription.deleteOne({channel:channelId})
        if(!del)
        {
            throw new ApiError(400,"Error while unsubscribing")
        }
        return res.status(200).json(new ApiResponse(200,del,"Unsubscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {    
    const {channelId} = req.params
    if(!channelId)
    {
        throw new ApiError(400,"channnelId is required")
    }

    const subscriber = await Subscription.aggregate([
        {
            $match:{
                $and:[
                    {
                        subscriber:{$exists:true}
                    },
                    {
                        channel: new mongoose.Types.ObjectId(channelId)
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
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
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner",
                }
            }
        }
    ])

    if(!subscriber)
    {
        throw new ApiError(404,"Subscribers not found")
    }
    return res.status(200).json(new ApiResponse(200,subscriber,"Subscribers fetched successfully"))
  
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    // TODO: get subscribed channels
    if(!subscriberId || !subscriberId.trim())
    {
        throw new ApiError(400,"subscriberId is required")
    }
    
    const subscribedChannel = await Subscription.aggregate([
        {
            $match: {
                $and: [
                    {
                        subscriber: new mongoose.Types.ObjectId(subscriberId)
                    },
                    {
                        channel: { $exists: true}
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        
    ])

   res.status(200).json(new ApiResponse(200, subscribedChannel, "get All subscribed channel"));

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}