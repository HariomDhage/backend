import mongoose, { Schema, Types, plugin } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const commentSchema = new Schema(
  {
    content: {
      type: String, // cloudinary url
      required: true,
    },
    
    video: {
      type: Schema.Types.ObjectId,
      ref: "videos",
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "users"
    }
  },
  {
    timestamps: true,
  }
)

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment",commentSchema);