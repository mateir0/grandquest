"use client";

import React, { useState, useRef } from "react";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideToConfirmProps {
  /** Text to show before sliding */
  text?: string;
  /** Text to show after confirming */
  successText?: string;
  /** Async callback fired when slide completes */
  onConfirm: () => Promise<void> | void;
  /** Width of the component */
  width?: number;
  /** Height of the component */
  height?: number;
  /** Additional classes for the container */
  className?: string;
}

export function SlideToConfirm({
  text = "Slide to confirm",
  successText = "Confirmed",
  onConfirm,
  width = 320,
  height = 56,
  className,
}: SlideToConfirmProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const trackWidth = width - height; // Total drag distance
  const thumbSize = height - 8; // Margin inside

  const x = useMotionValue(0);
  const controls = useAnimation();

  // Opacity of the text fades out as you drag
  const textOpacity = useTransform(x, [0, trackWidth * 0.5], [1, 0]);
  // Background gradient progresses as you drag
  const bgWidth = useTransform(x, [0, trackWidth], [height, width]);

  const handleDragEnd = async () => {
    if (state !== "idle") return;

    if (x.get() >= trackWidth * 0.9) {
      // Completed drag
      controls.start({ x: trackWidth, transition: { type: "spring", stiffness: 400, damping: 30 } });
      setState("loading");

      try {
        await onConfirm();
        setState("success");
      } catch (error) {
        // If error, reset
        setState("idle");
        controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } });
      }
    } else {
      // Reset if not fully dragged
      controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } });
    }
  };

  const handleReset = () => {
    if (state === "success") {
      setState("idle");
      x.set(0);
      controls.start({ x: 0 });
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        // GrantQuest: parchment track, brass knob — see .gq-slide in globals.css.
        "gq-slide",
        state === "success" ? "gq-slide-success" : "",
        className
      )}
      style={{
        width,
        height,
      }}
      onClick={handleReset}
    >
      {/* Background fill — brass wash deepening into brass-dark on success */}
      <motion.div
        className="gq-slide-fill"
        style={{
          width: state === "success" ? width : bgWidth,
          backgroundColor: state === "success" ? "#6e631f" : "#b5a642",
          opacity: state === "success" ? 0.22 : 0.14,
        }}
        animate={{ width: state === "success" ? width : undefined }}
        transition={{ duration: 0.3 }}
      />

      {/* Main Text */}
      <motion.span
        className="gq-slide-text"
        style={{ opacity: state === "idle" ? textOpacity : 0 }}
      >
        {text}
      </motion.span>

      {/* Success Text */}
      <motion.span
        className="gq-slide-success-text"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: state === "success" ? 1 : 0,
          y: state === "success" ? 0 : 10
        }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {successText}
      </motion.span>

      {/* Draggable Thumb */}
      <motion.div
        drag={state === "idle" ? "x" : false}
        dragConstraints={{ left: 0, right: trackWidth }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className={cn("gq-slide-thumb", state !== "idle" && "gq-slide-thumb-busy")}

        initial={false}
        whileTap={{ scale: state === "idle" ? 0.95 : 1 }}
        animate={state === "success" ? { x: trackWidth, backgroundColor: "#6e631f", color: "#f5deb3" } : controls}
        style={{
          width: thumbSize,
          height: thumbSize,
          x,
        }}
      >
        <motion.div
          animate={{
            rotate: state === "loading" ? 360 : 0,
            scale: state === "idle" ? 1 : 0,
            opacity: state === "idle" ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="gq-slide-icon"
        >
          <ArrowRight className="h-5 w-5 opacity-70" />
        </motion.div>

        <motion.div
          animate={{
            scale: state === "loading" ? 1 : 0,
            opacity: state === "loading" ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="gq-slide-icon gq-slide-spinner"
        >
          {/* Refined macOS Style Spinner (12 Spokes) */}
          <div className="gq-slide-spokes">
            {[...Array(12)].map((_, i) => (
              <motion.span
                key={i}
                className="gq-slide-spoke"
                style={{
                  rotate: i * 30,
                  transformOrigin: "center 10px",
                }}
                animate={{
                  opacity: [0.15, 1, 0.15],
                }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: i * 0.091,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          animate={{
            scale: state === "success" ? 1 : 0,
            opacity: state === "success" ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="gq-slide-icon"
        >
          <Check className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </div>
  );
}
