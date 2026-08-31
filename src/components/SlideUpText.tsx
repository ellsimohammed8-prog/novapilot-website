import React from "react";
import { motion } from "framer-motion";

interface SlideUpTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export const SlideUpText: React.FC<SlideUpTextProps> = ({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  yOffset = 40,
}) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: yOffset, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration,
          delay,
          ease: [0.23, 1, 0.32, 1], // Royal Nova / Emil design easing
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
