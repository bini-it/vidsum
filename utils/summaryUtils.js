import { CohereClientV2 } from 'cohere-ai';
import { prepareSummaryPrompt } from './prompt.js';
import JSON5 from 'json5';
import JSON from 'json5';
const client = new CohereClientV2({ token: process.env.CO_API_KEY });

export const generateSummary = async (transcriptEntries, videoId) => {
  const prompt = prepareSummaryPrompt(transcriptEntries);
  // console.log('prompt>>', prompt);

  try {
    const response = await client.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    // console.log('responseSummary>>', response);
    const content = response.message?.content?.[0]?.text;
    // console.log('contentsummary>>', content);
    if (!content) return { success: false, summary: null };
    const parsed = cleanAndParseJson(content);
    if (!isValidSummary(parsed)) return { success: false, summary: null };
    parsed.notableMoments = parsed.notableMoments.map((moment) => {
      const seconds = timeStringToSeconds(moment.startTime);
      return {
        ...moment,
        url: `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`,
      };
    });
    return { success: true, summary: parsed };
    s;
  } catch (error) {
    console.error('Error generating response:', error);
    return { success: false, summary: null };
  }
};
// Enhanced validation
function isValidSummary(data) {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.overview === 'string' &&
    Array.isArray(data.keyPoints) &&
    data.keyPoints.every((point) => typeof point === 'string') &&
    Array.isArray(data.notableMoments) &&
    data.notableMoments.every(
      (moment) =>
        typeof moment.startTime === 'string' &&
        typeof moment.endTime === 'string' &&
        typeof moment.description === 'string'
    ) &&
    typeof data.conclusion === 'string'
  );
}

function fixBrokenJson(input) {
  // Replace newlines inside double quotes with a space
  return input.replace(/"([^"]*)\n([^"]*)"/g, (match, p1, p2) => {
    return `"${p1} ${p2}"`;
  });
}
function cleanAndParseJson(input) {
  // console.log('input', input);
  try {
    const cleanedInput = input
      .replace(/^```json\s*/g, '')
      .replace(/\s*```$/g, '');
    const fixedInput = fixBrokenJson(cleanedInput);
    return JSON.parse(fixedInput);
  } catch {
    try {
      return JSON5.parse(input);
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  }
}
function timeStringToSeconds(timeString) {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else {
    return Number(parts[0]);
  }
}
export default generateSummary;
