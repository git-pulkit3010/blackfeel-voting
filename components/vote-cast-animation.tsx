"use client";

import { useState, useEffect, useRef } from "react";

interface VoteCastAnimationProps {
  onComplete: () => void;
}

export default function VoteCastAnimation({ onComplete }: VoteCastAnimationProps) {
  const message = "Your Vote Has Been Cast";

  const [displayText, setDisplayText] = useState("");
  const [phase, setPhase] = useState<"typing" | "done">("typing");

  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear everything on phase change
    indexRef.current = 0;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const runTypingLoop = (textToType: string, nextPhaseCallback: () => void) => {
      const typeChar = () => {
        const currentIndex = indexRef.current;

        // Safety check to prevent 'undefined'
        if (currentIndex >= textToType.length) {
          timeoutRef.current = setTimeout(() => {
            nextPhaseCallback();
          }, 1200);
          return;
        }

        const char = textToType.charAt(currentIndex);
        setDisplayText((prev) => prev + char);
        indexRef.current++;

        let speed = Math.floor(Math.random() * (120 - 60 + 1) + 60);
        if (char === " ") speed = 150; // Slightly longer pause for spaces

        timeoutRef.current = setTimeout(typeChar, speed);
      };

      typeChar();
    };

    if (phase === "typing") {
      setDisplayText("");
      runTypingLoop(message, () => setPhase("done"));
    } else if (phase === "done") {
      // Call onComplete after a delay so the message stays visible
      timeoutRef.current = setTimeout(onComplete, 1500);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-5xl px-8">
        <pre
          className={`font-mono text-4xl md:text-6xl whitespace-pre-wrap leading-tight text-white text-center font-bold transition-opacity duration-500 ${
            phase === "done" ? "opacity-0" : "opacity-100"
          }`}
        >
          {displayText}

          {phase !== "done" && (
            <span className="animate-pulse inline-block w-3 h-8 md:w-5 md:h-12 bg-white ml-2 align-middle"></span>
          )}
        </pre>
      </div>
    </div>
  );
}
