const secondsToHMS = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${h}:${m}:${s}`;
};
const prepareSummaryPrompt = (transcriptEntries) => {
  // Format the transcript with timestamps for context
  const formattedTranscript = transcriptEntries
    .map((entry) => {
      const start = secondsToHMS(entry.offset);
      const end = secondsToHMS(entry.offset + entry.duration);
      return `[${start} - ${end}] ${entry.text}`;
    })
    .join(',');

  return `
  You are analyzing a YouTube video transcript. Create a comprehensive summary that includes:

  1. **Video Overview** (2-3 sentences):
     - Clearly state the main topic/purpose
     - Identify the video's genre/type (tutorial, review, podcast, etc.)

  2. **Key Points** (bullet points):
     - Extract 3-5 most important ideas
     - Include notable facts/statistics
     - Mention any products/tools discussed

  3. **Notable Moments** (with timestamps):
     - Highlight 2-3 impactful segments
     - Format as: {"startTime": "HH:MM:SS", "endTime": "HH:MM:SS", "description": "..."}

  4. **Conclusion**:
     - How the video wraps up
     - Any calls-to-action or final thoughts

  Additional Instructions:
  - Maintain neutral, objective tone
  - Preserve technical terms when relevant
  - Skip sponsor segments unless crucial
  - Timecodes should be from the original transcript
  - Output as valid JSON

  Example Output Format:
  {
    "overview": "...",
    "keyPoints": ["...", "..."],
    "notableMoments": [
      {"startTime": "00:12:34", "endTime": "00:29:30", "description": "..."}
    ],
    "conclusion": "..."
  }

  Transcript:
  ${formattedTranscript}
  `;
};
export { prepareSummaryPrompt };
