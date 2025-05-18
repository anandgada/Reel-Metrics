import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
  username: String,
  reels: [
    {
      reelUrl: String,
      likes: Number,
      comments: Number,
      views: Number,
      thumbnail: String,
      caption: String,
      postedAt: Date,
      scrapedAt: { type: Date, default: Date.now },
    },
  ],
  jobId: String,
  status: {
    type: String,
    enum: ["queued", "in_progress", "completed", "failed"],
    default: "queued",
  },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  error: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

reelSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Reel = mongoose.model("Reel", reelSchema);

export default Reel;
