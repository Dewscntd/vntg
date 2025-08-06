// Realistic file upload and image processing simulation
const simulateDelay = (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// File upload simulation with realistic behaviors
export class MockFileUploadManager {
  private uploadedFiles = new Map<string, any>();
  private uploadProgress = new Map<string, number>();

  async uploadFile(
    file: File | Blob,
    options: {
      bucket: string;
      path: string;
      progressCallback?: (progress: number) => void;
      validationRules?: {
        maxSize?: number;
        allowedTypes?: string[];
        imageMaxDimensions?: { width: number; height: number };
      };
    }
  ) {
    const { bucket, path, progressCallback, validationRules } = options;
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Simulate file validation
    await this.validateFile(file, validationRules);

    // Simulate chunked upload with progress
    return new Promise<any>((resolve, reject) => {
      let progress = 0;
      const uploadInterval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random progress between 5-20%

        if (progress >= 100) {
          progress = 100;
          clearInterval(uploadInterval);

          // Simulate upload completion
          setTimeout(() => {
            const fileInfo = this.completeUpload(uploadId, file, bucket, path);
            this.uploadProgress.delete(uploadId);
            resolve(fileInfo);
          }, 200);
        }

        this.uploadProgress.set(uploadId, progress);
        progressCallback?.(progress);
      }, 100); // Update progress every 100ms

      // Simulate random upload failures
      if (Math.random() < 0.05) {
        // 5% chance of failure
        setTimeout(
          () => {
            clearInterval(uploadInterval);
            this.uploadProgress.delete(uploadId);
            reject(new Error('Upload failed: Network error'));
          },
          Math.random() * 2000 + 1000
        ); // Fail after 1-3 seconds
      }
    });
  }

  private async validateFile(file: File | Blob, rules?: any) {
    await simulateDelay(100);

    if (!rules) return;

    // File size validation
    if (rules.maxSize && file.size > rules.maxSize) {
      throw new Error(
        `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size ${this.formatFileSize(rules.maxSize)}`
      );
    }

    // File type validation
    if (rules.allowedTypes && file instanceof File) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!rules.allowedTypes.includes(fileExtension)) {
        throw new Error(
          `File type .${fileExtension} is not allowed. Allowed types: ${rules.allowedTypes.join(', ')}`
        );
      }
    }

    // Image dimension validation (simulated)
    if (rules.imageMaxDimensions && file instanceof File && file.type.startsWith('image/')) {
      await this.validateImageDimensions(file, rules.imageMaxDimensions);
    }
  }

  private async validateImageDimensions(
    file: File,
    maxDimensions: { width: number; height: number }
  ) {
    await simulateDelay(200); // Simulate image processing time

    // Simulate reading image dimensions
    const mockDimensions = {
      width: Math.floor(Math.random() * 4000) + 500,
      height: Math.floor(Math.random() * 3000) + 500,
    };

    if (
      mockDimensions.width > maxDimensions.width ||
      mockDimensions.height > maxDimensions.height
    ) {
      throw new Error(
        `Image dimensions ${mockDimensions.width}x${mockDimensions.height} exceed maximum allowed ${maxDimensions.width}x${maxDimensions.height}`
      );
    }
  }

  private completeUpload(uploadId: string, file: File | Blob, bucket: string, path: string) {
    const fileInfo = {
      id: uploadId,
      bucket,
      path,
      name: file instanceof File ? file.name : 'blob',
      size: file.size,
      type: file.type || 'application/octet-stream',
      url: this.generateMockUrl(bucket, path),
      created_at: new Date().toISOString(),
      metadata: {
        width: file.type?.startsWith('image/') ? Math.floor(Math.random() * 2000) + 500 : undefined,
        height: file.type?.startsWith('image/')
          ? Math.floor(Math.random() * 1500) + 400
          : undefined,
      },
    };

    this.uploadedFiles.set(uploadId, fileInfo);
    return fileInfo;
  }

  private generateMockUrl(bucket: string, path: string): string {
    const baseUrl = 'https://mock-storage.supabase.co/storage/v1/object/public';
    return `${baseUrl}/${bucket}/${path}?t=${Date.now()}`;
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Image processing simulations
  async resizeImage(file: File, dimensions: { width: number; height: number }, quality = 0.8) {
    await simulateDelay(800); // Simulate image processing time

    // Create a mock processed file
    const processedFile = new File([file], file.name, { type: file.type });
    Object.defineProperty(processedFile, 'size', {
      value: Math.floor(file.size * quality),
      writable: false,
    });

    return {
      file: processedFile,
      originalSize: file.size,
      newSize: processedFile.size,
      dimensions,
      compressionRatio: (1 - processedFile.size / file.size) * 100,
    };
  }

  async generateThumbnails(file: File, sizes: { width: number; height: number; suffix: string }[]) {
    await simulateDelay(1200); // Simulate thumbnail generation

    const thumbnails = sizes.map((size) => ({
      size: size.suffix,
      width: size.width,
      height: size.height,
      url: `${this.generateMockUrl('thumbnails', file.name)}_${size.suffix}`,
      fileSize: Math.floor((file.size * (size.width * size.height)) / (1920 * 1080)), // Rough estimation
    }));

    return thumbnails;
  }

  // Batch upload simulation
  async uploadMultipleFiles(files: File[], options: any) {
    const uploads: Promise<any>[] = [];

    files.forEach((file, index) => {
      const filePath = `${options.path}/${Date.now()}-${index}-${file.name}`;
      uploads.push(
        this.uploadFile(file, {
          ...options,
          path: filePath,
          progressCallback: (progress) => {
            options.batchProgressCallback?.(index, progress, files.length);
          },
        })
      );
    });

    return Promise.allSettled(uploads);
  }

  // File management operations
  async deleteFile(bucket: string, path: string) {
    await simulateDelay(150);

    // Find file by path
    const file = Array.from(this.uploadedFiles.values()).find(
      (f) => f.bucket === bucket && f.path === path
    );

    if (!file) {
      throw new Error('File not found');
    }

    this.uploadedFiles.delete(file.id);
    return { success: true };
  }

  async listFiles(bucket: string, prefix?: string, limit = 100) {
    await simulateDelay(200);

    const files = Array.from(this.uploadedFiles.values())
      .filter((f) => f.bucket === bucket)
      .filter((f) => !prefix || f.path.startsWith(prefix))
      .slice(0, limit);

    return {
      files,
      total: files.length,
      hasMore: files.length === limit,
    };
  }

  async getFileInfo(bucket: string, path: string) {
    await simulateDelay(100);

    const file = Array.from(this.uploadedFiles.values()).find(
      (f) => f.bucket === bucket && f.path === path
    );

    if (!file) {
      throw new Error('File not found');
    }

    return file;
  }

  // CDN and optimization simulation
  async generateOptimizedUrl(
    bucket: string,
    path: string,
    transformations?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    }
  ) {
    await simulateDelay(50);

    const baseUrl = this.generateMockUrl(bucket, path);

    if (!transformations) {
      return baseUrl;
    }

    const params = new URLSearchParams();
    if (transformations.width) params.append('w', transformations.width.toString());
    if (transformations.height) params.append('h', transformations.height.toString());
    if (transformations.quality) params.append('q', transformations.quality.toString());
    if (transformations.format) params.append('f', transformations.format);

    return `${baseUrl}&${params.toString()}`;
  }

  // Progress tracking
  getUploadProgress(uploadId: string): number | undefined {
    return this.uploadProgress.get(uploadId);
  }

  // Statistics
  getStorageStats(bucket: string) {
    const bucketFiles = Array.from(this.uploadedFiles.values()).filter((f) => f.bucket === bucket);
    const totalSize = bucketFiles.reduce((sum, file) => sum + file.size, 0);
    const filesByType = bucketFiles.reduce(
      (acc, file) => {
        const type = file.type.split('/')[0] || 'other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalFiles: bucketFiles.length,
      totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize),
      filesByType,
      averageFileSize: bucketFiles.length > 0 ? totalSize / bucketFiles.length : 0,
    };
  }
}

// Preset validation rules for common use cases
export const fileValidationPresets = {
  productImages: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['jpg', 'jpeg', 'png', 'webp'],
    imageMaxDimensions: { width: 4000, height: 4000 },
  },
  avatars: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['jpg', 'jpeg', 'png'],
    imageMaxDimensions: { width: 1000, height: 1000 },
  },
  documents: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['pdf', 'doc', 'docx', 'txt'],
  },
  videos: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['mp4', 'webm', 'mov'],
  },
};

// Export singleton instance
export const mockFileUploadManager = new MockFileUploadManager();
