import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { getCaseHistory, getCaseAnalysisHistory, type AnalysisResult } from '@/services/api/cases';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, getStatusColor, getStatusLabel } from '@/utils';
import type { LegalCase } from '@/types';

export function ReportsPage() {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, AnalysisResult[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getCaseHistory(1, 50);
        setCases(result.data.data);

        // Load analysis history for each case
        const analysisMap = new Map<string, AnalysisResult[]>();
        for (const caseItem of result.data.data) {
          try {
            const history = await getCaseAnalysisHistory(caseItem.id);
            analysisMap.set(caseItem.id, history);
          } catch {
            // Case may not have analyses
          }
        }
        setAnalyses(analysisMap);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse mb-6" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const casesWithAnalyses = cases.filter(c => analyses.get(c.id) && analyses.get(c.id)!.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-primary mb-2">Reports</h1>
        <p className="text-sm text-text-muted mb-6">
          View your case analysis history and legal guidance reports.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{cases.length}</p>
                <p className="text-sm text-text-muted">Total Cases</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp size={24} className="text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{casesWithAnalyses.length}</p>
                <p className="text-sm text-text-muted">Analyzed Cases</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <Calendar size={24} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {Array.from(analyses.values()).reduce((sum, arr) => sum + arr.length, 0)}
                </p>
                <p className="text-sm text-text-muted">Total Analyses</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Reports List */}
      <div>
        <h2 className="font-heading text-2xl font-semibold text-primary mb-6">
          Recent Analyses
        </h2>

        {casesWithAnalyses.length === 0 ? (
          <Card className="text-center py-16">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-6 opacity-40" />
            <h3 className="font-heading font-semibold text-primary mb-3 text-xl">No analyses yet</h3>
            <p className="text-base text-text-muted mb-6">
              Analyze your cases to generate legal reports.
            </p>
            <Link to="/dashboard">
              <Button icon={<ArrowRight size={20} />}>Go to Dashboard</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {casesWithAnalyses.map((caseItem, index) => {
              const caseAnalyses = analyses.get(caseItem.id) || [];
              const latestAnalysis = caseAnalyses[0];
              
              return (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/dashboard/case/${caseItem.id}`}>
                    <Card hover className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-text truncate text-base">
                              {caseItem.case_title}
                            </h3>
                            <Badge className={getStatusColor(caseItem.status)}>
                              {getStatusLabel(caseItem.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-muted mb-3">
                            {caseItem.category} · {formatDate(caseItem.created_at)}
                          </p>
                          {latestAnalysis && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-text">Latest Analysis:</span>
                                <Badge variant="info">
                                  Confidence: {Math.round(latestAnalysis.confidence_score * 100)}%
                                </Badge>
                                <Badge variant={latestAnalysis.severity_level === 'Critical' || latestAnalysis.severity_level === 'High' ? 'danger' : 'success'}>
                                  {latestAnalysis.severity_level}
                                </Badge>
                              </div>
                              <p className="text-sm text-text-muted line-clamp-2">
                                {latestAnalysis.summary}
                              </p>
                              <p className="text-xs text-text-muted">
                                {caseAnalyses.length} analysis{caseAnalyses.length !== 1 ? 'es' : ''} total
                              </p>
                            </div>
                          )}
                        </div>
                        <ArrowRight size={20} className="text-text-muted ml-4 flex-shrink-0" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
