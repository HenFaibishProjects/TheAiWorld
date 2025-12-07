import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RagService, RagUploadResponse } from './rag.service';
import { BackToHomeButtonComponent } from '../back-to-home-button/back-to-home-button';

interface UploadedFile {
  fileName: string;
  vectorStoreId: string;
  fileCount: number;
  status: string;
  timestamp: Date;
}

@Component({
  selector: 'app-rag-upload',
  standalone: true,
  imports: [CommonModule, BackToHomeButtonComponent],
  templateUrl: './rag-upload.component.html',
  styleUrls: ['./rag-upload.component.css']
})
export class RagUploadComponent {
  selectedFile: File | null = null;
  isDragging = false;
  isUploading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  uploadHistory: UploadedFile[] = [];

  constructor(private ragService: RagService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.errorMessage = null;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.errorMessage = null;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file to upload';
      return;
    }

    this.isUploading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.ragService.uploadFile(this.selectedFile).subscribe({
      next: (response: RagUploadResponse) => {
        this.successMessage = `File "${response.fileName}" uploaded successfully!`;
        this.uploadHistory.unshift({
          fileName: response.fileName,
          vectorStoreId: response.vectorStoreId,
          fileCount: response.fileCount,
          status: response.status,
          timestamp: new Date()
        });
        this.selectedFile = null;
        this.isUploading = false;
      },
      error: (error: any) => {
        console.error('Error uploading file:', error);
        this.errorMessage = error.error?.message || 'Failed to upload file. Please try again.';
        this.isUploading = false;
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatTime(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      case 'json':
        return '📋';
      case 'csv':
        return '📊';
      default:
        return '📁';
    }
  }
}
