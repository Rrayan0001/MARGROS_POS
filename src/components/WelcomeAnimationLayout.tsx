"use client";

import Image from "next/image";
import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Phase = "logo" | "done";

export default function WelcomeAnimationLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const hasPlayed = useRef(false);

  // Always start "done" on server to avoid hydration mismatch.
  // Switch to "logo" on the client only if conditions are met.
  const [phase, setPhase] = useState<Phase>("done");

  useEffect(() => {
    const onLoginPage = pathname === "/auth/login";
    if (hasPlayed.current || prefersReducedMotion || !onLoginPage) return;

    hasPlayed.current = true;
    setPhase("logo");

    const t = setTimeout(() => setPhase("done"), 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflow = phase === "logo" ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [phase]);

  return (
    <>
      <motion.div
        animate={phase === "done" ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        style={{ minHeight: "100vh" }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {phase === "logo" && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.28, filter: "blur(18px)" }}
              animate={{
                opacity: [0, 0.35, 0.85, 1],
                scale: [0.28, 0.58, 1.12, 1],
                filter: ["blur(18px)", "blur(10px)", "blur(2px)", "blur(0px)"],
              }}
              transition={{
                duration: 1.1,
                delay: 0.08,
                ease: "easeOut",
                times: [0, 0.42, 0.82, 1],
              }}
              style={{
                position: "relative",
                width: 160,
                height: 160,
                transformPerspective: 1200,
              }}
            >
              <Image
                src="/logo.png"
                alt="MARGROS POS"
                fill
                priority
                style={{ objectFit: "contain" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
