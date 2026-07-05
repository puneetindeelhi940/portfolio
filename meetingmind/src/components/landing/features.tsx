"use client";

import { motion } from "framer-motion";
import {
  FileText,
  CheckSquare,
  Scale,
  AlertTriangle,
  Users,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: FileText,
    title: "AI Summary",
    description:
      "Get a concise, structured summary of every meeting — key topics, context, and outcomes distilled in seconds.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: CheckSquare,
    title: "Action Items",
    description:
      "Automatically extract every action item with clear ownership and priority, so nothing slips through the cracks.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Scale,
    title: "Decisions",
    description:
      "Capture every decision made, with supporting rationale and context, creating a searchable decision log.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: AlertTriangle,
    title: "Risks",
    description:
      "Identify risks and blockers mentioned in discussion, categorized by severity and mapped to mitigation steps.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Users,
    title: "Owners",
    description:
      "Automatically detect and assign owners to action items and decisions — clear accountability from day one.",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
  },
  {
    icon: Clock,
    title: "Deadlines",
    description:
      "Surface explicit and implicit deadlines, map them to action items, and track completion against timelines.",
    gradient: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-400",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function Features() {
  return (
    <section id="features" className="relative px-4 py-24 sm:py-32">
      {/* Section header */}
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
            Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything your meetings need.
            <br />
            <span className="text-muted-foreground">Nothing they don&apos;t.</span>
          </h2>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group relative"
            >
              <div
                className={cn(
                  "glass relative h-full rounded-2xl p-6 transition-all duration-300",
                  "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
                  "hover:-translate-y-1"
                )}
              >
                {/* Gradient background on hover */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    feature.gradient
                  )}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div
                    className={cn(
                      "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80 transition-colors group-hover:bg-muted",
                      feature.iconColor
                    )}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
