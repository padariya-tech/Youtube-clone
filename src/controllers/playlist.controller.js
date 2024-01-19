import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    // if(!name || !description)
    // {
    //     throw new ApiError(400,"All fields are required")
    // }

   const playlist =  await Playlist.create({
        name,
        description,
        owner:req.user._id,
        videos:[]
    
    })
    if(!playlist)
    {
        throw new ApiError(400,"Something went wrong while creating playlist")
    }
    return res.status(201).json(new ApiResponse(201,playlist,"Playlist created successfully"))
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    // const playlists = await Playlist.find({owner:userId})
    // if(!playlists)
    // {
    //     throw new ApiError(404,"Playlists not found")
    // }
    // return res.status(200).json(new ApiResponse(200,playlists,"Playlists fetched successfully"))
    if(!userId){
        throw new ApiError(400,"User Id is required")
    }
    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
               
        }}
    ])
    if(!playlists)
    {
        throw new ApiError(404,"Playlists not found")
    }
    res.status(200).json(new ApiResponse(200,playlists,"Playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    // const playlist = await Playlist.findById(playlistId);
    // if(!playlist)
    // {
    //     throw new ApiError(404,"Playlist not found")
    // }
    // return res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched successfully"))
    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId),
            },
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        createdAt:1,
                                        avatar:1,
                                    },
                                },
                            ],
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
                        $project:{
                            title:1,
                            description:1,
                            duration:1,
                            views:1,
                            createdAt:1,
                            _id:1,
                            videoFile:1,
                            thumbnail:1,
                            owner:1,
                        },
                    },
                ],
            },
        },
    ]);
    if (!playlist) {
        throw new ApiError(400, "invalid playlist Id");
      }
    return res.status(200).json(new ApiResponse(200,playlist[0],"Playlist fetched successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    let {playlistId, videoId} = req.params
    // TODO: add video to playlist
    playlistId = playlistId.trim();
    videoId = videoId.trim();
    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $push:{
            videos:videoId
        }
    },
    {new:true})

    if(!playlist)
    {
        throw new ApiError(404,"Error while adding video to playlist")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{
            videos:videoId
        }
    },
    {new:true})

    if(!playlist)
    {
        throw new ApiError(404,"Error while removing video form playlist")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const delPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if(!delPlaylist)
    {
        throw new ApiError(404,"Playlist not found or already deleted")
    }
    return res.status(200).json(new ApiResponse(200,delPlaylist,"Playlist deleted successfully"))
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name,
            description
        }},
        {
            new:true
        }
    )

    if(!playlist)
    {
        throw new ApiError(404,"Playlist not found or error while updating")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist updated successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
