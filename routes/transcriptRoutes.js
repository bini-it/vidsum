import express from 'express';
import {
  getTranscriptByVideoUrl,
  summarizeTranscript,
  getAllVideoTranscripts,
  getAllVideoSummaries,
} from '../controllers/transcriptController.js';

const router = express.Router();

router.get('/', getAllVideoTranscripts);
router.get('/summary', getAllVideoSummaries);
router.post('/', getTranscriptByVideoUrl);
router.post('/summary', summarizeTranscript);

export default router;
