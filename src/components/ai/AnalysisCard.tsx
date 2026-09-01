import { AlertCircle, CheckCircle, Info, TrendingUp, ExternalLink, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnalysisResult } from '@/services/api/cases';

interface AnalysisCardProps {
  analysis: AnalysisResult;
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  const getSeverityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getSeverityIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return <CheckCircle size={16} />;
      case 'medium':
        return <Info size={16} />;
      case 'high':
        return <TrendingUp size={16} />;
      case 'critical':
        return <AlertCircle size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  const confidencePercentage = Math.round(analysis.confidence_score * 100);

  // Handle both old and new schema
  const legalIssue = analysis.legal_issue || (analysis as any).legal_category || 'Unknown';
  const evidenceRequired = analysis.evidence_required || (analysis as any).possible_legal_issues || [];
  const recommendedActions = analysis.recommendations || (analysis as any).recommended_actions || [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6">
        <h3 className="font-heading font-semibold text-lg text-primary mb-3">
          Summary
        </h3>
        <p className="text-text leading-relaxed">{analysis.summary}</p>
      </Card>

      {/* Legal Issue & Severity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-lg text-primary mb-3">
            Legal Issue
          </h3>
          <p className="text-text">{legalIssue}</p>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-semibold text-lg text-primary mb-3">
            Severity Assessment
          </h3>
          <div className="flex items-center gap-3">
            <Badge className={getSeverityColor(analysis.severity_level)}>
              <div className="flex items-center gap-1">
                {getSeverityIcon(analysis.severity_level)}
                <span className="capitalize">{analysis.severity_level}</span>
              </div>
            </Badge>
            <span className="text-sm text-text-muted">
              Score: {analysis.severity_score}/100
            </span>
          </div>
        </Card>
      </div>

      {/* Legal Reasoning */}
      {analysis.legal_reasoning && (
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-lg text-primary mb-3">
            Legal Reasoning
          </h3>
          <p className="text-text leading-relaxed">{analysis.legal_reasoning}</p>
        </Card>
      )}

      {/* Applicable Laws */}
      {analysis.applicable_laws && analysis.applicable_laws.length > 0 && (
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-lg text-primary mb-4 flex items-center gap-2">
            <BookOpen size={20} />
            Applicable Laws
          </h3>
          <div className="space-y-4">
            {analysis.applicable_laws.map((law, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-text">{law.act_name}</h4>
                  <span className="text-xs bg-surface px-2 py-1 rounded">
                    {law.jurisdiction}
                  </span>
                </div>
                {law.section && (
                  <p className="text-sm text-text-muted mb-2">
                    Section: {law.section}
                    {law.section_title && ` - ${law.section_title}`}
                  </p>
                )}
                <p className="text-sm text-text mb-2">{law.explanation}</p>
                {law.source_url && (
                  <a
                    href={law.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary-light flex items-center gap-1"
                  >
                    <ExternalLink size={14} />
                    View Source
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Legal Reasoning */}
      {analysis.legal_reasoning && (
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-lg text-primary mb-3">
            Legal Reasoning
          </h3>
          <p className="text-text leading-relaxed">{analysis.legal_reasoning}</p>
        </Card>
      )}

      {/* Evidence Required */}
      {evidenceRequired.length > 0 && (
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-lg text-primary mb-4">
            Evidence Required
          </h3>
          <ul className="space-y-2">
            {evidenceRequired.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-text">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recommended Actions */}
      {recommendedActions.length > 0 && (
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-lg text-primary mb-4">
            Recommended Actions
          </h3>
          <ul className="space-y-2">
            {recommendedActions.map((action, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle size={16} className="text-success mt-1 flex-shrink-0" />
                <span className="text-text">{action}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Important Points */}
      {analysis.important_points && analysis.important_points.length > 0 && (
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-lg text-primary mb-4">
            Important Points to Remember
          </h3>
          <ul className="space-y-2">
            {analysis.important_points.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <Info size={16} className="text-accent mt-1 flex-shrink-0" />
                <span className="text-text">{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Sources */}
      {analysis.sources && analysis.sources.length > 0 ? (
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-lg text-primary mb-4 flex items-center gap-2">
            <BookOpen size={20} />
            Legal Sources Referenced
          </h3>
          <div className="space-y-3">
            {analysis.sources.map((source, index) => (
              <div key={index} className="flex items-start justify-between gap-2 p-3 bg-surface rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-text">{source.title}</p>
                  {source.section && (
                    <p className="text-sm text-text-muted">Section: {source.section}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-surface px-2 py-1 rounded border border-border">
                      {source.jurisdiction}
                    </span>
                    <span className="text-xs bg-surface px-2 py-1 rounded border border-border">
                      {source.relevance}
                    </span>
                  </div>
                </div>
                {source.source_url && (
                  <a
                    href={source.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-light"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-700">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-heading font-semibold text-amber-900 dark:text-amber-300 mb-2">
                Limited Legal Grounding
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                No authoritative legal documents were retrieved for this analysis. The guidance provided is based on general legal principles and should be verified with authoritative legal sources.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Confidence Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-semibold text-lg text-primary mb-1">
              AI Confidence Score
            </h3>
            <p className="text-sm text-text-muted">
              Based on the information provided
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {confidencePercentage}%
            </div>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="p-6 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-700">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-heading font-semibold text-amber-900 dark:text-amber-300 mb-2">
              Disclaimer
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              {analysis.disclaimer}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
