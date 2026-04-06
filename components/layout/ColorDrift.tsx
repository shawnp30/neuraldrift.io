"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const ColorDrift = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Primary Orb - Cyan */}
      <motion.div
        animate={{
          x: mousePosition.x * 0.1,
          y: mousePosition.y * 0.1 + scrollY * 0.2,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 20, mass: 2 }}
        className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[150px] mix-blend-screen"
      />
      
      {/* Secondary Orb - Purple */}
      <motion.div
        animate={{
          x: -mousePosition.x * 0.05,
          y: -mousePosition.y * 0.05 + scrollY * 0.1,
        }}
        transition={{ type: "spring", damping: 40, stiffness: 15, mass: 3 }}
        className="absolute top-[40%] right-[10%] w-[600px] h-[600px] bg-accent-purple/5 rounded-full blur-[150px] mix-blend-screen"
      />
      
      {/* Tertiary Orb - Emerald (Very subtle) */}
      <motion.div
        animate={{
          x: mousePosition.x * 0.15,
          y: -mousePosition.y * 0.1 + scrollY * 0.3,
        }}
        transition={{ type: "spring", damping: 60, stiffness: 25, mass: 1 }}
        className="absolute bottom-[20%] left-[30%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-screen"
      />
    </div>
  );
};
