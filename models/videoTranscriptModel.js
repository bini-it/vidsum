import mongoose from 'mongoose';

const TranscriptEntrySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  lang: {
    type: String,
    required: true,
  },
  offset: {
    type: Number,
    required: true,
    min: 0,
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
  },
  end: {
    type: Number,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

const VideoTranscriptSchema = new mongoose.Schema(
  {
    videoUrl: {
      type: String,
      required: true,
      unique: true,
    },
    entries: [TranscriptEntrySchema],
  },
  { timestamps: true }
);

const VideoTranscript = mongoose.model(
  'VideoTranscript',
  VideoTranscriptSchema
);

export default VideoTranscript;
