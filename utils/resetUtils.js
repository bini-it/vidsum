import VideoSummary from '../models/videoSummaryModel.js';
import VideoTranscript from '../models/videoTranscriptModel.js';

const clearAllTranscripts = async () => {
  try {
    const [transcriptsResult, summariesResult] = await Promise.all([
      VideoTranscript.deleteMany({}),
      VideoSummary.deleteMany({}),
    ]);

    const results = {
      transcripts: transcriptsResult,
      summaries: summariesResult,
    };

    console.log(`Cleared database: 
      - ${results.transcripts.deletedCount} transcripts removed
      - ${results.summaries.deletedCount} summaries removed`);

    return results;
  } catch (error) {
    console.error(
      'Failed to clear transcripts:',
      error instanceof Error ? error.message : error
    );
    throw new Error('Failed to clear transcripts and summaries');
  }
};
export { clearAllTranscripts };
