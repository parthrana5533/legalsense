import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Upload, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCases } from '@/hooks/useCases';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatDate, getStatusColor, getStatusLabel } from '@/utils';

const quickActions = [
  {
    icon: Plus,
    title: 'Create New Case',
    description: 'Start a new legal case analysis',
    path: '/dashboard/new-case',
    color: 'bg-primary/5 text-primary',
  },
  {
    icon: Upload,
    title: 'Upload Documents',
    description: 'Add evidence to existing cases',
    path: '/dashboard/upload-select',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: FileText,
    title: 'View Reports',
    description: 'Access your legal reports',
    path: '/dashboard/reports',
    color: 'bg-green-50 text-success',
  },
];

export function DashboardPage() {
  const { user, profile } = useAuth();
  const { cases, loading } = useCases();
  const recentCases = (cases || []).slice(0, 5);
  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'User';

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-primary mb-2">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-text-muted">
              Here&apos;s what&apos;s happening with your cases
            </p>
          </div>
          <Link to="/dashboard/new-case">
            <Button icon={<Plus size={20} />}>New Case</Button>
          </Link>
        </div>
      </motion.div>

      <div>
        <h2 className="font-heading text-2xl font-semibold text-primary mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={action.path}>
                <Card hover className="h-full">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${action.color}`}
                  >
                    <action.icon size={24} />
                  </div>
                  <h3 className="font-semibold text-text text-base">{action.title}</h3>
                  <p className="text-sm text-text-muted mt-2">{action.description}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-semibold text-primary">
            Recent Cases
          </h2>
          {cases.length > 5 && (
            <span className="text-sm text-text-muted">
              {cases.length} total cases
            </span>
          )}
        </div>

        {recentCases.length === 0 ? (
          <Card className="text-center py-16">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-6 opacity-40" />
            <h3 className="font-heading font-semibold text-primary mb-3 text-xl">No cases yet</h3>
            <p className="text-base text-text-muted mb-6">
              Create your first case to get started with legal guidance.
            </p>
            <Link to="/dashboard/new-case">
              <Button icon={<Plus size={20} />}>Create New Case</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentCases.map((caseItem, index) => (
              <motion.div
                key={caseItem.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/dashboard/case/${caseItem.id}`}>
                  <Card hover className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-text truncate text-base">
                        {caseItem.case_title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-text-muted">
                          {caseItem.category}
                        </span>
                        <span className="text-sm text-text-muted">·</span>
                        <span className="text-sm text-text-muted">
                          {formatDate(caseItem.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <Badge className={getStatusColor(caseItem.status)}>
                        {getStatusLabel(caseItem.status)}
                      </Badge>
                      <ArrowRight size={20} className="text-text-muted" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
