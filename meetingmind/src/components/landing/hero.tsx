"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16">
      {/* Background grid */}
      <div className="bg-grid pointer-events-none absolute inset-0" />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[600px] rounded-full bg-violet-600/[0.05] blur-[100px]" />
        <div className="absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/[0.04] blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-muted px-4 py-1.5 text-sm font-medium text-accent"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Meeting Intelligence
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Every Meeting Should
          <br />
          End With{" "}
          <span className="gradient-text">Accountability</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Upload any meeting transcript and let AI extract summaries, action
          items, decisions, risks, owners, and deadlines — turning
          conversations into structured, trackable intelligence.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30"
          >
            Upload Transcript
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 text-base font-medium text-muted-foreground transition-all hover:border-accent/30 hover:text-foreground hover:bg-muted/30"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Decorative terminal preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mx-auto mt-16 max-w-2xl"
        >
          <div className="glass rounded-xl p-1 shadow-2xl shadow-black/10">
            <div className="rounded-lg bg-muted/50 p-4">
              {/* Terminal header */}
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  meetingmind-ai
                </span>
              </div>
              {/* Terminal content */}
              <div className="space-y-2 font-mono text-xs sm:text-sm">
                <div className="flex gap-2">
                  <span className="text-accent">$</span>
                  <span className="text-foreground/80">
                    Analyzing Q4 Planning Meeting...
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-500">+</span>
                  <span className="text-muted-foreground">
                    3 action items extracted
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-500">+</span>
                  <span className="text-muted-foreground">
                    2 decisions documented
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-500">+</span>
                  <span className="text-muted-foreground">
                    1 risk flagged
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-accent">+</span>
                  <span className="text-foreground/80">
                    All owners and deadlines assigned
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
