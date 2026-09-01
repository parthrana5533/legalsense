import { motion } from 'framer-motion';
import {
  Brain,
  Upload,
  History,
  CheckSquare,
  FileText,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

const features = [
  {
    icon: Brain,
    title: 'AI Legal Analysis',
    description:
      'Advanced AI reviews your case against relevant laws and precedents to provide accurate guidance.',
  },
  {
    icon: Upload,
    title: 'Document Upload',
    description:
      'Upload contracts, notices, receipts, and other evidence for comprehensive case analysis.',
  },
  {
    icon: History,
    title: 'Case History',
    description:
      'Keep track of all your legal cases in one place with searchable history and status tracking.',
  },
  {
    icon: CheckSquare,
    title: 'Evidence Checklist',
    description:
      'Receive a tailored checklist of evidence you should gather to strengthen your case.',
  },
  {
    icon: FileText,
    title: 'Legal Report',
    description:
      'Get a structured report with applicable laws, severity assessment, and recommendations.',
  },
  {
    icon: Lock,
    title: 'Privacy',
    description:
      'Your data is encrypted and secure. We never share your legal information with third parties.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-primary mb-6">
            Everything You Need
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Comprehensive legal guidance tools designed for clarity and accessibility.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Card hover className="h-full">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
