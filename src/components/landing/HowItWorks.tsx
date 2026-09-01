import { motion } from 'framer-motion';
import {
  MessageSquare,
  Upload,
  Brain,
  FileText,
  ArrowDown,
} from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    title: 'Describe your issue',
    description: 'Tell us about your legal situation in plain language.',
  },
  {
    icon: Upload,
    title: 'Upload evidence',
    description: 'Optionally attach documents, images, or records.',
  },
  {
    icon: Brain,
    title: 'AI analyzes your case',
    description: 'Our AI reviews your case against applicable laws.',
  },
  {
    icon: FileText,
    title: 'Receive legal report',
    description: 'Get a structured report with actionable guidance.',
  },
];

export function HowItWorks() {
  return (
    <section id="about" className="py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-primary mb-6">
            How LegalSense Works
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Four simple steps to understand your legal rights and get structured guidance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative text-center"
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-5">
                  <step.icon className="w-9 h-9 text-primary" />
                </div>
                <span className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
                  Step {index + 1}
                </span>
                <h3 className="font-heading text-xl font-semibold text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-base text-text-muted">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-5 top-10 text-accent/40">
                  <ArrowDown className="rotate-[-90deg]" size={24} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
