import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload,
  X,
  FileText,
  Image,
  Mic,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createCase, uploadCaseFile, CASE_CATEGORIES } from '@/services/api/cases';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { formatFileSize } from '@/utils';
import type { CaseCategory } from '@/types';

export function NewCasePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CaseCategory | ''>('');
  const [description, setDescription] = useState('');
  const [locationCountry, setLocationCountry] = useState('India');
  const [locationState, setLocationState] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Dispute title is required';
    if (!category) newErrors.category = 'Please select a category';
    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.trim().length < 20)
      newErrors.description = 'Please provide at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image size={16} />;
    return <FileText size={16} />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setLoading(true);
    try {
      const newCase = await createCase({
        case_title: title.trim(),
        category: category as CaseCategory,
        case_description: description.trim(),
        location_country: locationCountry,
        location_state: locationState.trim() || undefined,
        location_city: locationCity.trim() || undefined,
      });
      
      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          await uploadCaseFile(newCase.id, file);
        }
      }
      
      navigate(`/dashboard/case/${newCase.id}`);
    } catch {
      setErrors({ general: 'Failed to create case. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-2xl font-bold text-primary mb-2">
          Create New Case
        </h1>
        <p className="text-sm text-text-muted mb-6">
          Provide details about your legal situation to receive AI-powered guidance.
        </p>

        {errors.general && (
          <div className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-900 dark:text-red-300 text-base">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <Input
              label="Dispute Title"
              placeholder="e.g., Landlord Security Deposit Dispute"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
            />
          </Card>

          <Card>
            <label className="block text-base font-medium text-text mb-4">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CASE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-3 rounded-xl text-base font-medium border transition-all ${
                    category === cat
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-text-muted hover:border-primary/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-sm text-danger mt-3">{errors.category}</p>
            )}
          </Card>

          <Card>
            <Textarea
              label="Description"
              placeholder="Describe your legal issue in detail. Include relevant dates, parties involved, and what outcome you're seeking..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              rows={8}
            />
          </Card>

          <Card>
            <label className="block text-base font-medium text-text mb-4">
              Location
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Country
                </label>
                <select
                  value={locationCountry}
                  onChange={(e) => setLocationCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  State
                </label>
                <Input
                  placeholder="e.g., Maharashtra"
                  value={locationState}
                  onChange={(e) => setLocationState(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  City
                </label>
                <Input
                  placeholder="e.g., Mumbai"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  icon={<MapPin size={20} />}
                />
              </div>
            </div>
          </Card>

          <Card>
            <label className="block text-base font-medium text-text mb-4">
              Evidence Upload
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
                        <p className="text-sm text-text-muted">
                          {formatFileSize(file.size)}
                        </p>
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
              </div>
            )}

            <div className="mt-5 p-5 rounded-xl bg-gray-50 border border-border flex items-center gap-4 opacity-60">
              <Mic size={24} className="text-text-muted" />
              <div>
                <p className="text-base font-medium text-text-muted">
                  Voice Recording
                </p>
                <p className="text-sm text-text-muted">
                  Coming soon — record your case description by voice
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Submit Case
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
