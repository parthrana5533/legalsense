import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Image,
  Brain,
  Sparkles,
  Loader2,
  MapPin,
  Upload,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { getCaseById, getCaseFiles, analyzeCase, getCaseAnalysis, updateCase, deleteCaseFile, type LegalCase, type CaseFile, type AnalysisResult } from '@/services/api/cases';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { AnalysisCard } from '@/components/ai/AnalysisCard';
import {
  formatDate,
  formatDateTime,
  formatFileSize,
  getStatusColor,
  getStatusLabel,
} from '@/utils';

export function CaseDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<LegalCase | null>(null);
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    case_title: '',
    case_description: '',
    category: '' as any,
    location_country: '',
    location_state: '',
    location_city: '',
  });

  const loadingMessages = [
    'Analyzing your case...',
    'Retrieving relevant Indian legal sources...',
    'Generating legal guidance...',
  ];

  useEffect(() => {
    let interval: number;
    if (analyzing) {
      interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  useEffect(() => {
    async function load() {
      if (!caseId) return;
      setLoading(true);
      try {
        const data = await getCaseById(caseId);
        setCaseData(data);
        setEditForm({
          case_title: data.case_title,
          case_description: data.case_description,
          category: data.category,
          location_country: data.location_country || '',
          location_state: data.location_state || '',
          location_city: data.location_city || '',
        });
        const filesData = await getCaseFiles(caseId);
        setFiles(filesData);
        
        // Load existing analysis if available
        const existingAnalysis = await getCaseAnalysis(caseId);
        setAnalysis(existingAnalysis);
      } catch (error) {
        console.error('Failed to load case:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [caseId]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!caseId) return;
    try {
      await updateCase(caseId, editForm);
      const updated = await getCaseById(caseId);
      setCaseData(updated);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update case:', error);
    }
  };

  const handleCancelEdit = () => {
    if (caseData) {
      setEditForm({
        case_title: caseData.case_title,
        case_description: caseData.case_description,
        category: caseData.category,
        location_country: caseData.location_country || '',
        location_state: caseData.location_state || '',
        location_city: caseData.location_city || '',
      });
    }
    setEditing(false);
  };

  const handleViewFile = (file: CaseFile) => {
    if (file.public_url) {
      window.open(file.public_url, '_blank');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this evidence?')) {
      return;
    }

    try {
      await deleteCaseFile(fileId);
      // Refresh files list
      if (caseId) {
        const filesData = await getCaseFiles(caseId);
        setFiles(filesData);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const handleAnalyze = async () => {
    if (!caseId || analyzing) return;
    setAnalyzing(true);
    setAnalysisError(null);
    setLoadingMessageIndex(0);
    try {
      const result = await analyzeCase(caseId);
      setAnalysis(result);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze case';
      
      // Check if this is a 503 Service Unavailable error (quota exhaustion)
      // Preserve existing analysis and show temporary error
      if (error?.response?.status === 503 || errorMessage.includes('temporarily unavailable') || errorMessage.includes('API quota limits')) {
        setAnalysisError(errorMessage);
        // Do NOT clear the existing analysis - it will be preserved
      } else {
        // For other errors, clear the analysis as before
        setAnalysisError(errorMessage);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-5xl mx-auto text-center py-24">
        <h2 className="font-heading text-2xl font-semibold text-primary mb-3">
          Case not found
        </h2>
        <p className="text-base text-text-muted mb-6">
          The case you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link to="/dashboard" className="text-primary text-base font-medium hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-4">
          <Link to="/dashboard" className="text-text-muted hover:text-primary transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            {editing ? (
              <Input
                value={editForm.case_title}
                onChange={(e) => setEditForm({ ...editForm, case_title: e.target.value })}
                className="text-2xl font-bold font-heading"
              />
            ) : (
              <div>
                <h1 className="font-heading text-2xl font-bold text-primary">
                  {caseData.case_title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Badge variant="info">{caseData.category as any}</Badge>
                  <Badge className={getStatusColor(caseData.status as any)}>
                    {getStatusLabel(caseData.status as any)}
                  </Badge>
                  <span className="text-sm text-text-muted">
                    Created {formatDate(caseData.created_at)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Link to={`/dashboard/case/${caseId}/upload`}>
              <Button variant="outline" icon={<Upload size={18} />}>
                Upload Evidence
              </Button>
            </Link>
            {editing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" icon={<Edit size={18} />} onClick={handleEdit}>
                Edit
              </Button>
            )}
          </div>
        </div>

        <Card className="mb-8">
          <h2 className="font-heading font-lg font-semibold text-primary mb-4">Description</h2>
          {editing ? (
            <textarea
              value={editForm.case_description}
              onChange={(e) => setEditForm({ ...editForm, case_description: e.target.value })}
              className="w-full p-4 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px]"
              rows={8}
            />
          ) : (
            <p className="text-base text-text leading-relaxed whitespace-pre-wrap">
              {caseData.case_description}
            </p>
          )}
          {editing && (
            <div className="mt-4 space-y-4">
              <label className="block text-base font-medium text-text">Location</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Country</label>
                  <select
                    value={editForm.location_country}
                    onChange={(e) => setEditForm({ ...editForm, location_country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">State</label>
                  <input
                    type="text"
                    value={editForm.location_state}
                    onChange={(e) => setEditForm({ ...editForm, location_state: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., Maharashtra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">City</label>
                  <input
                    type="text"
                    value={editForm.location_city}
                    onChange={(e) => setEditForm({ ...editForm, location_city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., Mumbai"
                  />
                </div>
              </div>
            </div>
          )}
          {!editing && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-muted">
              {caseData.location_country && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{caseData.location_country}</span>
                </div>
              )}
              {caseData.location_state && <span>{caseData.location_state}</span>}
              {caseData.location_city && <span>{caseData.location_city}</span>}
            </div>
          )}
        </Card>

        {files.length > 0 && (
          <Card className="mb-8">
            <h2 className="font-heading text-lg font-semibold text-primary mb-4">
              Uploaded Files ({files.length})
            </h2>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border"
                >
                  {file.file_type === 'image' ? (
                    <Image size={20} className="text-primary" />
                  ) : (
                    <FileText size={20} className="text-primary" />
                  )}
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {file.public_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye size={16} />}
                        onClick={() => handleViewFile(file)}
                      >
                        View
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* AI Analysis Section */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-primary">
                  AI Legal Analysis
                </h2>
                {!analysis && !analyzing && (
                  <p className="text-base text-text-muted">
                    Analyze this case to receive structured legal guidance based on the case details and available legal sources.
                  </p>
                )}
                {analyzing && (
                  <p className="text-base text-text-muted animate-pulse">
                    {loadingMessages[loadingMessageIndex]}
                  </p>
                )}
              </div>
            </div>
            {!analysis ? (
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                icon={analyzing ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Case'}
              </Button>
            ) : (
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                variant="secondary"
                icon={analyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Again'}
              </Button>
            )}
          </div>
          {analysisError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm font-medium text-red-900 dark:text-red-300 mb-2">Unable to complete the analysis</p>
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">{analysisError}</p>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                variant="secondary"
                size="sm"
                icon={analyzing ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
              >
                {analyzing ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
          )}
        </Card>

        {/* Analysis Results */}
        {analysis && <AnalysisCard analysis={analysis} />}
      </motion.div>
    </div>
  );
}
