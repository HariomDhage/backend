import mongoose, { Schema, Types, plugin } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema(
  {
    comment: {
      type: Schema.Types.ObjectId, // cloudinary url
      ref: "Comment",
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Videos",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
)

export const Like = mongoose.model("Like", likeSchema);
