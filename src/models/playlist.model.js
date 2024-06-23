import mongoose, {Schema} from "mongoose"

const playlistSchma = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos:[ {
      type: mongoose.Types.ObjectId,
      ref: "V0ideo",
    }],
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
)

export const Playlist = mongoose.model("Playlist",playlistSchma)