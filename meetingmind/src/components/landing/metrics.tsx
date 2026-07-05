"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart3, Clock, DollarSign, TrendingUp } from "lucide-react";

interface Metric {
  icon: React.ElementType;
  value: number;
  suffix: string;
  prefix: string;
  label: string;
  iconColor: string;
}

const metrics: Metric[] = [
  {
    icon: BarChart3,
    value: 142,
    suffix: "+",
    prefix: "",
    label: "Meetings Analyzed",
    iconColor: "text-violet-400",
  },
  {
    icon: Clock,
    value: 284,
    suffix: "+",
    prefix: "",
    label: "Hours Saved",
    iconColor: "text-blue-400",
  },
  {
    icon: DollarSign,
    value: 42,
    suffix: "K+",
    prefix: "$",
    label: "Cost Saved",
    iconColor: "text-emerald-400",
  },
  {
    icon: TrendingUp,
    value: 78,
    suffix: "%",
    prefix: "",
    label: "Action Completion Rate",
    iconColor: "text-amber-400",
  },
];

function AnimatedCounter({
  value,
  prefix,
  suffix,
  isInView,
}: {
  value: number;
  prefix: string;
  suffix: string;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      const progress = current / steps;
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));

      if (current >= steps) {
        clearInterval(timer);
        setCount(value);
      }
    }, stepDuration);
  }, [value]);

  useEffect(() => {
    if (isInView) {
      animate();
    }
  }, [isInView, animate]);

  return (
    <span className="tabular-nums">
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export function Metrics() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="metrics" className="relative px-4 py-24 sm:py-32">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.04] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
            Impact
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The numbers speak for themselves
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="glass group rounded-2xl p-6 text-center transition-all duration-300 hover:border-accent/30 hover:-translate-y-1">
                <div
                  className={`mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted/80 ${metric.iconColor}`}
                >
                  <metric.icon className="h-6 w-6" />
                </div>
                <div className="mb-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  <AnimatedCounter
                    value={metric.value}
                    prefix={metric.prefix}
                    suffix={metric.suffix}
                    isInView={isInView}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
