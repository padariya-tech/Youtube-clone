import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const videos = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user?._id) },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "totalLikes"
                        }
                    }
                ]
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                totalVideo: {
                    $size: "$video"
                },
                totalViews: {
                    $sum: "$video.views"
                },
                totalSubscriber: {
                    $size: "$subscribers",
               
                },
               
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                totalVideo: 1,
                totalViews: 1,
                totalSubscriber: 1,
                
            }
        }
    ]);
    const ans = await Video.aggregate([
        {
            $match: {
                $and: [
                    {
                        owner: new mongoose.Types.ObjectId(req.user?._id),
                    },
                    {
                        isPublished: true,
                    },

                ],
            },
        
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "totalLikes"
            }
        },
        {
            // find total comments for each video
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "totalComments"
            }
        },
        {
            $addFields: {
                totalLikes: {
                    $size: "$totalLikes"
                },
                totalComments: {
                    $size: "$totalComments"
                }
            }
        },
        
        {
            
            $project: {
                title: 1,
                thumbnail: 1,
                views: 1,
                totalLikes: 1,
                totalComments: 1,
                formattedCreatedAt: {
                  $dateToString: {
                    date: "$createdAt",
                    format: "%Y-%m-%d", // Use %m for numeric month
                    timezone: "UTC",
                  },
                },
              }
              
        },
        {
            $sort: {
                totalLikes: -1
            }
        },
        
    ])
    const responseData = {
        stats: ans,
        channelStats: videos,
      };
      res.status(200).json(new ApiResponse(200, responseData, "get channel stats"));

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.aggregate([
        {
          $match: {
            $and: [
              {
                owner: new mongoose.Types.ObjectId(req.user?._id),
              },
              {
                isPublished: true,
              },
            ],
          },
        },
      ]);
    
      res.status(200).json(new ApiResponse(200, videos, "get all videos"));
})

export {
    getChannelStats, 
    getChannelVideos
    }