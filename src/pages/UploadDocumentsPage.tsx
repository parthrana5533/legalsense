import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload,
  X,
  FileText,
  Image,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { getCaseById, uploadCaseFile, getCaseFiles } from '@/services/api/cases';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatFileSize, formatDateTime } from '@/utils';
import type { CaseFile } from '@/types';

export function UploadDocumentsPage() {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caseData, setCaseData] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!caseId) return;
      try {
        const data = await getCaseById(caseId);
        setCaseData(data);
        const filesData = await getCaseFiles(caseId);
        setUploadedFiles(filesData);
      } catch (err) {
        setError('Failed to load case');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [caseId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File | CaseFile) => {
    if ('file_type' in file && file.file_type === 'image') return <Image size={16} />;
    if ('type' in file && file.type?.startsWith('image/')) return <Image size={16} />;
    return <FileText size={16} />;
  };

  const handleUpload = async () => {
    if (!caseId || files.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        await uploadCaseFile(caseId, file);
      }
      // Refresh uploaded files
      const filesData = await getCaseFiles(caseId);
      setUploadedFiles(filesData);
      setFiles([]);
    } catch (err) {
      setError('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto text-center py-24">
        <h2 className="font-heading text-2xl font-semibold text-primary mb-3">
          Case not found
        </h2>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate(`/dashboard/case/${caseId}`)}
          >
            Back to Case
          </Button>
        </div>

        <h1 className="font-heading text-3xl font-bold text-primary mb-2">
          Upload Documents
        </h1>
        <p className="text-base text-text-muted mb-8">
          Add evidence to: {caseData.case_title}
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-danger text-base">
            {error}
          </div>
        )}

        <Card className="mb-8">
          <label className="block text-base font-medium text-text mb-4">
            Upload New Files
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/2 transition-all"
          >
            <Upload className="w-10 h-10 text-text-muted mx-auto mb-4" />
            <p className="text-base font-medium text-text">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-text-muted mt-2">
              Images, PDFs, and documents supported
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="mt-5 space-y-3">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-background border border-border"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-primary">{getFileIcon(file)}</div>
                    <div className="min-w-0">
                      <p className="text-base font-medium truncate">{file.name}</p>
                      <p className="text-sm text-text-muted">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-2 text-text-muted hover:text-danger transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <Button
                onClick={handleUpload}
                loading={uploading}
                className="w-full"
                icon={<Upload size={18} />}
              >
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </Card>

        {uploadedFiles.length > 0 && (
          <Card>
            <h2 className="font-heading text-lg font-semibold text-primary mb-4">
              Uploaded Files ({uploadedFiles.length})
            </h2>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border"
                >
                  <div className="text-primary">{getFileIcon(file)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium truncate">{file.filename}</p>
                      {file.extracted_text && (
                        <Badge variant="success" className="text-xs">Text extracted</Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-muted">
                      {formatFileSize(file.file_size)} · {formatDateTime(file.uploaded_at)}
                    </p>
                  </div>
                  <CheckCircle size={20} className="text-success" />
                </div>
              ))}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
