import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }
  // const video = await Video.findById(videoId);
  const likedVideo = await Like.aggregate([
    {
      $match: {
        $and: [
          {
            video: new mongoose.Types.ObjectId(videoId),
          },
          {
            likedBy: new mongoose.Types.ObjectId(req.user?._id),
          },
        ],
      },
    },
  ]);
  //   console.log("liked: ", likedVideo[0]._id);
  if (likedVideo.length == 0) {
    await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
    res
      .status(200)
      .json(new ApiResponse(200, { isLiked: true }, "get likedVideo"));
  } else {
    await Like.findByIdAndDelete(likedVideo[0]._id);
    res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "get likedVideo"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId))
    {
        throw new ApiError(400,"Invalid comment id")
    }
    
    const comment = await Like.findOne({comment:commentId})
    if(!comment)
    {
        const like = await Like.create({
            comment:commentId,
            likedBy:req.user._id
        })
        if(!like)
        {
            throw new ApiError(400,"Error while adding like")
        }
        return res.status(200).json(new ApiResponse(200,like,"Like added successfully"))
    }
    else
    {
        const del = await Like.deleteOne({comment:commentId})
        if(!del)
        {
            throw new ApiError(400,"Error while deleting like")
        }
        return res.status(200).json(new ApiResponse(200,del,"Like removed successfully"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Invalid tweet id")
    }
    
    const tweet = await Like.findOne({tweet:tweetId})
    if(!tweet)
    {
        const like = await Like.create({
            tweet:tweetId,
            likedBy:req.user._id
        })
        if(!like)
        {
            throw new ApiError(400,"Error while adding like")
        }
        return res.status(200).json(new ApiResponse(200,like,"Like added successfully"))
    }
    else
    {
        const del = await Like.deleteOne({tweet:tweetId})
        if(!del)
        {
            throw new ApiError(400,"Error while deleting like")
        }
        return res.status(200).json(new ApiResponse(200,del,"Like removed successfully"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // const likes = await Like.find({likedBy:req.user._id})
    // // console.log(likes);
    // if(!likes)
    // {
    //     throw new ApiError(400,"Error while fetching liked videos")
    // }
    // const likevideo = likes.map((like) => like.video).filter((video) => video!==null && video !== undefined)
    // return res.status(200).json(new ApiResponse(200,likevideo,"Liked videos fetched successfully"))
    const likedVideo = await Like.aggregate([
    {
      $match: {
        $and: [
          {
            video: { $exists: true },
          },
          {
            likedBy: new mongoose.Types.ObjectId(req.user?._id),
          },
        ],
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, likedVideo, "get liked video"));
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}