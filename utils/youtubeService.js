import { YoutubeTranscript } from 'youtube-transcript';
import { formatYoutubeError, isValidTranscript } from './transcriptHelpers.js';
import { fetchTranscriptFromApi } from './transcriptUtils.js';
// Helper functions for each attempt layer
const attemptYoutubeScrape = async (videoUrl) => {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl).catch(
      (err) => {
        throw formatYoutubeError(err);
      }
    );

    if (!isValidTranscript(transcript)) {
      throw new Error('Invalid transcript from first attempt');
    }
    return transcript;
  } catch (err) {
    throw new Error(`Scraping failed: ${err.message}`);
  }
};

const attemptApiFallback = async (videoUrl) => {
  try {
    const { success, transcript } = await fetchTranscriptFromApi(videoUrl);
    if (!success || !isValidTranscript(transcript)) {
      throw new Error('API returned invalid transcript');
    }
    return transcript;
  } catch (err) {
    throw new Error(`API fallback failed: ${err.message}`);
  }
};

const attemptFinalFallback = async (videoUrl) => {
  return await attemptYoutubeScrape(videoUrl);
};
const validateProcessedTranscript = (processedTranscript) => {
  if (!processedTranscript || processedTranscript.length === 0) {
    throw new Error('Failed to process transcript');
  }
};

export {
  attemptApiFallback,
  attemptFinalFallback,
  validateProcessedTranscript,
  attemptYoutubeScrape,
};
