const prepareSummaryPrompt = (transcriptEntries) => {
  // Format the transcript with timestamps for context
  const formattedTranscript = transcriptEntries
    .map((entry) => `[ ${entry.startTime} - ${entry.endTime}] ${entry.text}`)
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
     - Format as: "[HH:MM:SS] Description"

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
