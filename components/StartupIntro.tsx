"use client";

import { useState, useEffect, useRef } from "react";

interface StartupIntroProps {
  onComplete: () => void;
}

export default function StartupIntro({ onComplete }: StartupIntroProps) {
  const part1 = "Designed by You \n Perfected by AI \n> Delivered by BlackFeel";
  const part2 = "Welcome to THE VOTE";

  const [displayText, setDisplayText] = useState("");
  const [phase, setPhase] = useState<"typingPart1" | "fadeOut" | "typingPart2" | "done">(
    "typingPart1"
  );

  // Refs to track state without causing re-renders
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false); // New safety flag

  useEffect(() => {
    // RESET LOGIC: When phase changes, reset index and flags
    indexRef.current = 0;
    hasStartedRef.current = false;
    
    // Clear any existing timeouts immediately
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // ------------------------------------------------
    // TYPE WRITER LOGIC
    // ------------------------------------------------
    const runTypingLoop = (textToType: string, nextPhaseCallback: () => void) => {
      
      const typeChar = () => {
        const currentIndex = indexRef.current;

        // 1. SAFETY CHECK: Stop if we are out of bounds (Fixes "undefined")
        if (currentIndex >= textToType.length) {
          // Finished typing this part. Wait, then trigger next phase.
          timeoutRef.current = setTimeout(() => {
            nextPhaseCallback();
          }, 1200); 
          return;
        }

        // 2. GET CHAR SAFELY: charAt returns "" if out of bounds, never "undefined"
        const char = textToType.charAt(currentIndex);
        
        setDisplayText((prev) => prev + char);
        indexRef.current++;

        // 3. RECURSION: Schedule next character
        const speed = Math.floor(Math.random() * (100 - 40 + 1) + 40); // Slightly faster for smoother feel
        timeoutRef.current = setTimeout(typeChar, speed);
      };

      typeChar();
    };

    // ------------------------------------------------
    // PHASE HANDLERS
    // ------------------------------------------------
    
    if (phase === "typingPart1") {
      setDisplayText(""); // Ensure clean slate
      runTypingLoop(part1, () => setPhase("fadeOut"));
    } 
    
    else if (phase === "fadeOut") {
      // Just wait for the CSS fade out, then switch phase
      timeoutRef.current = setTimeout(() => {
        setDisplayText(""); // Clear text while invisible
        setPhase("typingPart2");
      }, 600); // Matches CSS duration
    } 
    
    else if (phase === "typingPart2") {
      runTypingLoop(part2, () => {
        setPhase("done");
      });
    }
    
    else if (phase === "done") {
       timeoutRef.current = setTimeout(onComplete, 1500);
    }

    // CLEANUP: Kills the loop if component unmounts
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    
  }, [phase, onComplete]); // Removed part1/part2 from dependency to prevent restarts

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-5xl px-8">
        <pre
          className={`font-mono text-3xl md:text-5xl whitespace-pre-wrap leading-loose tracking-tight text-white text-center font-bold transition-opacity duration-500 ${
            phase === "fadeOut" ? "opacity-0" : "opacity-100"
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