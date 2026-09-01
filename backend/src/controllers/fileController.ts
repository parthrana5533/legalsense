/**
 * File Controller
 * Handles HTTP requests for file operations
 */

import { Request, Response } from 'express';
import { fileService } from '../services/fileService';
import { caseService } from '../services/caseService';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, CaseFile } from '../types';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export class FileController {
  /**
   * POST /api/files/upload
   * Upload a file for a case
   */
  uploadFile = upload.single('file');

  async handleUpload(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      if (!req.file) {
        const response: ApiResponse = {
          success: false,
          error: 'No file provided',
        };
        res.status(400).json(response);
        return;
      }

      const caseId = req.body.case_id;
      if (!caseId) {
        const response: ApiResponse = {
          success: false,
          error: 'Case ID is required',
        };
        res.status(400).json(response);
        return;
      }

      // Verify case ownership
      await caseService.getCaseById(caseId, req.user.id);

      // Upload file
      const fileRecord = await fileService.uploadCaseFile(
        caseId,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.file.size
      );

      const response: ApiResponse<CaseFile> = {
        success: true,
        data: fileRecord,
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
      };
      res.status(error instanceof Error && error.message === 'Case not found' ? 404 : 500).json(response);
    }
  }

  /**
   * GET /api/files/case/:caseId
   * Get all files for a case
   */
  async getCaseFiles(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      // Verify case ownership
      await caseService.getCaseById(req.params.caseId, req.user.id);

      const files = await fileService.getCaseFiles(req.params.caseId, req.user.id);

      const response: ApiResponse<CaseFile[]> = {
        success: true,
        data: files,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch files',
      };
      res.status(error instanceof Error && error.message === 'Case not found' ? 404 : 500).json(response);
    }
  }

  /**
   * DELETE /api/files/:id
   * Delete a file
   */
  async deleteFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      await fileService.deleteCaseFile(req.params.id, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'File deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete file';
      const response: ApiResponse = {
        success: false,
        error: errorMessage,
      };
      res.status(error instanceof Error && (errorMessage === 'File not found' || errorMessage === 'Access denied') ? 404 : 500).json(response);
    }
  }
}

export const fileController = new FileController();
