import express from 'express';
import {
  getFeedPosts,
  getUserPosts,
  likePost,
  commentPost,
  deleteComment,
  deletePost,
} from '../controllers/posts.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/* READ */
router.get('/', verifyToken, getFeedPosts);
router.get('/:userId/posts', verifyToken, getUserPosts);

/* UPDATE */
router.patch('/:id/like', verifyToken, likePost);
router.patch('/:id/comment', verifyToken, commentPost);

/* DELETE */
router.delete('/:id/delete-comment', verifyToken, deleteComment);
router.delete('/:id/delete-post', verifyToken, deletePost);

export default router;
