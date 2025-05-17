import { decode } from 'html-entities';

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [
    hrs > 0 ? String(hrs).padStart(2, '0') : null,
    String(mins).padStart(2, '0'),
    String(secs).padStart(2, '0'),
  ]
    .filter(Boolean)
    .join(':');
}
function doubleDecode(text) {
  return decode(decode(text));
}
const fetchTranscriptFromApi = async (videoUrl) => {
  const response = await fetch(
    `${process.env.RAPID_API_URL}/transcript-with-url?url=${videoUrl}`,
    {
      headers: {
        'x-rapidapi-host': `${process.env.RAPID_API_HOST}`,
        'x-rapidapi-key': `${process.env.RAPID_API_KEY}`,
      },
    }
  );
  const { success, transcript } = await response.json();
  if (success) {
    return { success: true, transcript };
  } else {
    return { success: false, transcript: [] || null };
  }
};

export { formatTime, doubleDecode, fetchTranscriptFromApi };
