import express from 'express';
import {
  getTranscriptByVideoUrl,
  summarizeTranscript,
  getAllVideoTranscripts,
} from '../controllers/transcriptController.js';

const router = express.Router();

router.get('/', getAllVideoTranscripts);
router.post('/', getTranscriptByVideoUrl);
router.post('/summary', summarizeTranscript);

export default router;
