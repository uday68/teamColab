import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import appConfig from '../config/app.js';

export class FileService {
  constructor() {
    this.files = new Map(); // In production, use a database
    this.uploadPath = './uploads';
    this.initializeUploadDirectory();
  }

  async initializeUploadDirectory() {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  // Configure multer for file uploads
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}_${file.originalname}`;
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req, file, cb) => {
      if (appConfig.chat.allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not allowed'), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: appConfig.chat.maxFileSize
      }
    });
  }

  // Save file metadata
  saveFileMetadata(file, uploadedBy, roomId) {
    const fileData = {
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: {
        id: uploadedBy.id,
        name: uploadedBy.name
      },
      roomId,
      uploadedAt: new Date(),
      downloadCount: 0,
      isPublic: false,
      path: file.path
    };

    this.files.set(fileData.id, fileData);
    return fileData;
  }

  // Get file metadata
  getFileMetadata(fileId) {
    return this.files.get(fileId);
  }

  // Get files for a room
  getRoomFiles(roomId, limit = 50, offset = 0) {
    const roomFiles = Array.from(this.files.values())
      .filter(file => file.roomId === roomId)
      .sort((a, b) => b.uploadedAt - a.uploadedAt);
    
    return roomFiles.slice(offset, offset + limit);
  }

  // Delete file
  async deleteFile(fileId, userId) {
    const file = this.files.get(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Only allow deletion by uploader or admin
    if (file.uploadedBy.id !== userId) {
      throw new Error('Not authorized to delete this file');
    }

    try {
      await fs.unlink(file.path);
      this.files.delete(fileId);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Get file stream for download
  async getFileStream(fileId) {
    const file = this.files.get(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    try {
      await fs.access(file.path);
      file.downloadCount++;
      return file;
    } catch (error) {
      throw new Error('File not accessible');
    }
  }

  // Get file statistics
  getFileStats(roomId) {
    const roomFiles = Array.from(this.files.values())
      .filter(file => file.roomId === roomId);
    
    const totalSize = roomFiles.reduce((sum, file) => sum + file.size, 0);
    const typeStats = new Map();
    
    roomFiles.forEach(file => {
      const type = file.mimetype.split('/')[0];
      typeStats.set(type, (typeStats.get(type) || 0) + 1);
    });

    return {
      totalFiles: roomFiles.length,
      totalSize,
      typeBreakdown: Object.fromEntries(typeStats),
      recentFiles: roomFiles
        .sort((a, b) => b.uploadedAt - a.uploadedAt)
        .slice(0, 10)
    };
  }

  // Clean up old files
  async cleanupOldFiles(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    const cutoff = new Date(Date.now() - maxAge);
    let deletedCount = 0;

    for (const [fileId, file] of this.files) {
      if (file.uploadedAt < cutoff) {
        try {
          await fs.unlink(file.path);
          this.files.delete(fileId);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete old file ${fileId}:`, error);
        }
      }
    }

    return deletedCount;
  }

  // Generate secure download link
  generateDownloadLink(fileId, expiresIn = 3600000) { // 1 hour
    const token = Buffer.from(JSON.stringify({
      fileId,
      expiresAt: Date.now() + expiresIn
    })).toString('base64');
    
    return `/api/files/download/${token}`;
  }

  // Validate download token
  validateDownloadToken(token) {
    try {
      const data = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (Date.now() > data.expiresAt) {
        throw new Error('Download link expired');
      }
      
      return data.fileId;
    } catch (error) {
      throw new Error('Invalid download link');
    }
  }

  // Get image thumbnail (for image files)
  async generateThumbnail(fileId, width = 200, height = 200) {
    const file = this.files.get(fileId);
    if (!file || !file.mimetype.startsWith('image/')) {
      throw new Error('Not an image file');
    }

    // In a real implementation, you'd use a library like sharp
    // For now, return the original file path
    return file.path;
  }
}

export const fileService = new FileService();
