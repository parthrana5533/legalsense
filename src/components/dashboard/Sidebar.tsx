import { Link, useLocation } from 'react-router-dom';
import {
  Plus,
  History,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useCases } from '@/hooks/useCases';
import { formatDate, getStatusColor, getStatusLabel, cn } from '@/utils';
import { CaseCardSkeleton } from '@/components/ui/Skeleton';

export function Sidebar() {
  const { logout } = useAuth();
  const { cases, loading } = useCases();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredCases = (cases || []).filter(
    (c) =>
      c.case_title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { icon: Plus, label: 'New Case', path: '/dashboard/new-case' },
    { icon: History, label: 'Case History', path: '/dashboard' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-border">
        <Logo size="sm" />
      </div>

      <div className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive =
            item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:bg-gray-50 hover:text-text'
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col px-4 mt-3">
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-base rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pb-4">
          {loading ? (
            <>
              <CaseCardSkeleton />
              <CaseCardSkeleton />
            </>
          ) : filteredCases.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No cases found</p>
          ) : (
            filteredCases.map((caseItem) => (
              <Link
                key={caseItem.id}
                to={`/dashboard/case/${caseItem.id}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block p-4 rounded-xl border border-transparent hover:border-border hover:bg-gray-50 transition-all',
                  location.pathname === `/dashboard/case/${caseItem.id}` &&
                    'border-primary/20 bg-primary/5'
                )}
              >
                <p className="text-base font-medium text-text truncate">
                  {caseItem.case_title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-text-muted">{caseItem.category}</span>
                  <span className="text-sm text-text-muted">·</span>
                  <span className="text-sm text-text-muted">
                    {formatDate(caseItem.created_at)}
                  </span>
                </div>
                <div className="mt-2">
                  <Badge className={getStatusColor(caseItem.status)}>
                    {getStatusLabel(caseItem.status)}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium text-text-muted hover:bg-red-50 hover:text-danger transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface border border-border shadow-card"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className="hidden md:flex flex-col w-64 h-screen bg-surface border-r border-border fixed left-0 top-0">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 z-50 flex flex-col w-64 h-screen bg-surface border-r border-border"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
