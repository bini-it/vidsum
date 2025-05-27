import mongoose from 'mongoose';

const VideoSummarySchema = new mongoose.Schema(
  {
    videoTranscriptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoTranscript',
      required: true,
    },
    videoUrl: { type: String, required: true },
    channelTitle: {
      type: String,
    },
    videoTitle: {
      type: String,
    },
    overview: { type: String, required: true },
    keyPoints: [{ type: String, required: true }],
    notableMoments: [
      {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    conclusion: { type: String, required: true },
  },
  { timestamps: true }
);

const VideoSummary = mongoose.model('VideoSummary', VideoSummarySchema);

export default VideoSummary;
