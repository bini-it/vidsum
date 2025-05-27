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

const getVideoDetails = async (videoUrl) => {
  const videoId = extractVideoId(videoUrl);

  const res = await fetch(
    `${process.env.API_URL}?part=snippet&id=${videoId}&key=${process.env.API_KEY}`
  );
  const data = await res.json();
  // console.log('videoData>>>', data);
  if (data.items && data.items.length > 0) {
    const snippet = data.items[0].snippet;
    return {
      title: snippet.title,
      thumbnail:
        snippet.thumbnails?.standard?.url ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.default?.url ||
        '',
      channelTitle: snippet.channelTitle,
    };
  } else {
    throw new Error('Video not found or API limit reached');
  }
};
function extractVideoId(url) {
  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export {
  attemptApiFallback,
  attemptFinalFallback,
  validateProcessedTranscript,
  attemptYoutubeScrape,
  getVideoDetails,
};
