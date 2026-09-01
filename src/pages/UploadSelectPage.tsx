import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ArrowRight, FileText } from 'lucide-react';
import { getCaseHistory } from '@/services/api/cases';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate, getStatusColor, getStatusLabel } from '@/utils';
import type { LegalCase } from '@/types';

export function UploadSelectPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getCaseHistory(1, 50);
        setCases(result.data.data);
      } catch (error) {
        console.error('Failed to load cases:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse mb-6" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold text-primary mb-2">
          Upload Documents
        </h1>
        <p className="text-base text-text-muted">
          Select a case to add evidence documents
        </p>
      </motion.div>

      {cases.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="w-16 h-16 text-text-muted mx-auto mb-6 opacity-40" />
          <h3 className="font-heading font-semibold text-primary mb-3 text-xl">No cases yet</h3>
          <p className="text-base text-text-muted mb-6">
            Create a case first to upload documents.
          </p>
          <Button onClick={() => navigate('/dashboard/new-case')} icon={<Upload size={20} />}>
            Create New Case
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {cases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => navigate(`/dashboard/case/${caseItem.id}/upload`)}
                className="w-full"
              >
                <Card hover className="flex items-center justify-between p-6">
                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="font-semibold text-text truncate text-base mb-2">
                      {caseItem.case_title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-text-muted">
                        {caseItem.category}
                      </span>
                      <span className="text-sm text-text-muted">·</span>
                      <span className="text-sm text-text-muted">
                        {formatDate(caseItem.created_at)}
                      </span>
                      <Badge className={getStatusColor(caseItem.status)}>
                        {getStatusLabel(caseItem.status)}
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-text-muted ml-4 flex-shrink-0" />
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
