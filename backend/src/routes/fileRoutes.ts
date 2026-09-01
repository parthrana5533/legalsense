/**
 * File Routes
 * Defines all file-related API endpoints
 */

import { Router } from 'express';
import { fileController } from '../controllers/fileController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/files/upload
 * @desc    Upload a file for a case
 * @access  Private
 */
router.post(
  '/upload',
  authenticate,
  fileController.uploadFile,
  asyncHandler(fileController.handleUpload.bind(fileController))
);

/**
 * @route   GET /api/files/case/:caseId
 * @desc    Get all files for a case
 * @access  Private
 */
router.get(
  '/case/:caseId',
  authenticate,
  asyncHandler(fileController.getCaseFiles.bind(fileController))
);

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete a file
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(fileController.deleteFile.bind(fileController))
);

export default router;
