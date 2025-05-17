import generateSummary from '../utils/summaryUtils.js';
import VideoTranscript from '../models/videoTranscriptModel.js';
import VideoSummary from '../models/videoSummaryModel.js';
import {
  attemptApiFallback,
  attemptFinalFallback,
  attemptYoutubeScrape,
  validateProcessedTranscript,
} from '../utils/youtubeService.js';
import {
  handleTranscriptError,
  processTranscriptData,
} from '../utils/transcriptHelpers.js';

const getAllVideoTranscripts = async (req, res) => {
  try {
    const transcripts = await VideoTranscript.find().lean();
    return res.status(200).json({
      success: true,
      count: transcripts.length,
      data: transcripts,
    });
  } catch (error) {
    console.error('Get All Transcripts Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch transcripts',
      type: 'SERVER_ERROR',
    });
  }
};

const getTranscriptByVideoUrl = async (req, res) => {
  const { videoUrl } = req.body;

  // console.log('videoUrl: >>> ', videoUrl);
  if (!videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Missing videoUrl',
      type: 'MISSING_INPUT',
    });
  }

  try {
    const existingTranscript = await VideoTranscript.findOne({ videoUrl });
    // console.log('existingTranscript: >>> ', existingTranscript);
    if (existingTranscript) {
      return res.status(200).json({
        success: true,
        existing: true,
        transcript: existingTranscript,
      });
    }
    let transcript;
    try {
      // 1. Attempt 1: Scraping Library

      transcript = await attemptYoutubeScrape(videoUrl);
    } catch (firstAttemptError) {
      console.log('First attempt failed:[message]', firstAttemptError.message);

      // 2. Attempt 2: RapidAPI fallback
      try {
        transcript = await attemptApiFallback(videoUrl);
      } catch (secondAttemptError) {
        console.log(
          'Second attempt failed:[message]',
          secondAttemptError.message
        );
        transcript = await attemptFinalFallback(videoUrl);

      }
    }
    const processedTranscript = processTranscriptData(transcript);
    validateProcessedTranscript(processedTranscript);

    const newTranscript = await VideoTranscript.create({
      videoUrl,
      entries: processedTranscript,
    });

    await newTranscript.save();

    return res.status(200).json({
      success: true,
      existing: false,
      transcript: newTranscript,
    });
  } catch (err) {
    console.error('Final transcript error:[message]', err.message);
    return handleTranscriptError(res, err);
  }
};

const summarizeTranscript = async (req, res) => {
  const { transcriptId } = req.body;

  if (!transcriptId) {
    return res.status(400).json({
      success: false,
      error: 'Missing transcriptId',
      type: 'MISSING_INPUT',
    });
  }
  // console.log('summarizeTranscript-videoId>>>', transcriptId);

  try {
    const transcript = await VideoTranscript.findById(transcriptId);
    if (!transcript) {
      return res.status(404).json({
        success: false,
        error: 'Transcript not found',
        type: 'TRANSCRIPT_NOT_FOUND',
      });
    }
    const existingSummary = await VideoSummary.findOne({
      videoTranscriptId: transcriptId,
    });
    if (existingSummary) {
      return res.status(200).json({
        success: true,
        existing: true,
        summary: existingSummary,
      });
    }
    // Generate summary
    const { success, summary } = await generateSummary(transcript.entries);
    // console.log('summary>>>', summary);

    if (!success) {
      throw new Error('Failed to generate summary');
    }
    const newSummary = new VideoSummary({
      videoTranscriptId: transcript._id,
      videoUrl: transcript.videoUrl,
      ...summary,
    });

    await newSummary.save();
    return res.status(200).json({
      success: true,
      existing: false,
      summary: newSummary,
    });
  } catch (err) {
    console.error('Summary Error:', err.message);

    if (err.message.includes('Failed to generate summary')) {
      return res.status(500).json({
        success: false,
        error: err.message,
        type: 'SUMMARY_GENERATION_FAILED',
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to process transcript summary',
        type: 'SERVER_ERROR',
      });
    }
  }
};

export { getTranscriptByVideoUrl, summarizeTranscript, getAllVideoTranscripts };
