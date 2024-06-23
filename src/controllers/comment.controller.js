import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video

  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const commentsQuery = Comment.find({ video: videoId })
  const total = await Comment.countDocuments({video: videoId})
  commentsQuery.skip((page - 1)*limit).limit(limit);
  const comments  = await commentsQuery;

  if (!comments.length) {
    throw new ApiError(404, "Comments not found");
  }

  return res
  .status(200)
  .json(new ApiResponse(200, {comments, total, page, limit}, "Comments fetched successfully"))



});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(404,"Invaid video ID");
    }

    const {text, userId} = res.body

    if (!text || text.trim().length ===0) {
        throw new ApiError(400,"NO data present in the text")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(404,"Invalid userID!!")
    }

    const videoExists = await videos.findById(userId);

    if (!videoExists) {
        throw new ApiError(404,"Video not found")
    }

    const comment = new Comment({
        text,
        video: videoId,
        user:userId

    })

    await comment.save();

    await videos.findByIdAndUpdate(videoId, {
        $push:{
            comment: comment._id
        }
    })

    return res
    .status(200)
    .json(new ApiResponse(200,comment, "Comment added successully"))




});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
    const { commentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new ApiError(404, "Invaid comment ID");
    }

    const { newComment } = res.body;

    if (!newComment || newComment.trim().length ===0) {
      throw new ApiError(404, "Comment does not have any text");
    }

    const newCommentId = await Comment.findById(commentId);

    if (!commentExists) {
      throw new ApiError(404, "Comment does not found");
    }

    newCommentId.text = newComment
    await newCommentId.save()

    return res
      .status(200)
      .json(new ApiResponse(200, newCommentId, "Comment updated successully"));



});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(404, "Invaid comment ID");
  }


  const deleteComment = await Comment.findById(commentId);

  if (!deleteComment) {
    throw new ApiError(404, "Comment does not found");
  }

  await Comment.findByIdAndRemove(commentId)

  return res
    .status(200)
    .json(new ApiResponse(200,{}, "Comment updated successully"));

});

export { getVideoComments, addComment, updateComment, deleteComment };
