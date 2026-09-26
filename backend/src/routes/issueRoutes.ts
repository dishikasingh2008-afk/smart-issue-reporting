import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  createIssue, getIssues, getIssueById, updateIssue, deleteIssue,
  toggleUpvote, checkDuplicates, submitRating,
} from '../controllers/issueController';

const router = Router();

router.use(requireAuth);
router.post('/check-duplicates', checkDuplicates);
router.post('/', upload.single('image'), createIssue);
router.get('/', getIssues);
router.get('/:id', getIssueById);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);
router.post('/:id/upvote', toggleUpvote);
router.post('/:id/rating', submitRating);

export default router;
