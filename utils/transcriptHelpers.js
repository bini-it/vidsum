import { doubleDecode, formatTime } from './transcriptUtils.js';

const formatYoutubeError = (err) => {
  if (err.message.includes('disabled')) {
    return new Error('Transcript is disabled for this video');
  }
  if (err.message.includes('not available')) {
    return new Error('Transcript not available for this video');
  }
  return err;
};

const isValidTranscript = (transcript) => {
  return (
    Array.isArray(transcript) &&
    transcript.length > 0 &&
    transcript.every((entry) => {
      if (!entry.text) return false;

      if (typeof entry.offset !== 'number' && typeof entry.offset !== 'string')
        return false;
      if (isNaN(parseFloat(entry.offset))) return false;

      if (
        typeof entry.duration !== 'number' &&
        typeof entry.duration !== 'string'
      )
        return false;
      if (isNaN(parseFloat(entry.duration))) return false;

      return true;
    })
  );
};
const processTranscriptData = (transcript) => {
  return transcript.map((entry) => {
    const offset =
      typeof entry.offset === 'string'
        ? parseFloat(entry.offset)
        : entry.offset;

    const duration =
      typeof entry.duration === 'string'
        ? parseFloat(entry.duration)
        : entry.duration;

    const end = offset + duration;

    return {
      text: doubleDecode(entry.text),
      offset: parseFloat(offset.toFixed(2)),
      duration: parseFloat(duration.toFixed(2)),
      end: parseFloat(end.toFixed(2)),
      startTime: formatTime(offset),
      endTime: formatTime(end),
      lang: entry.lang || 'en',
    };
  });
};
const handleTranscriptError = (res, err) => {
  const errorMap = {
    disabled: {
      status: 403,
      type: 'TRANSCRIPT_DISABLED',
      userMessage: 'Captions are not available for this video',
    },
    'not available': {
      status: 404,
      type: 'TRANSCRIPT_UNAVAILABLE',
      userMessage: 'No captions found for this video',
    },
    'Invalid video id': {
      status: 400,
      type: 'INVALID_VIDEO_URL',
      userMessage: 'Please check the YouTube URL and try again',
    },
    'Invalid transcript': {
      status: 422,
      type: 'INVALID_TRANSCRIPT_DATA',
      userMessage: 'Could not process video captions',
    },
    default: {
      status: 500,
      type: 'SERVER_ERROR',
      userMessage: 'Something went wrong. Please try again later',
    },
  };

  const matchedKey =
    Object.keys(errorMap).find((key) => err.message.includes(key)) || 'default';

  console.error('Transcript Error:', {
    type: errorMap[matchedKey].type,
    technicalMessage: err.message,
    stack: err.stack,
  });

  return res.status(errorMap[matchedKey].status).json({
    success: false,
    error: errorMap[matchedKey].userMessage,
    type: errorMap[matchedKey].type,
  });
};

export {
  formatYoutubeError,
  isValidTranscript,
  processTranscriptData,
  handleTranscriptError,
};
