"use client";

import { useState, useEffect, useRef } from "react";

interface StartupIntroProps {
  onComplete: () => void;
}

export default function StartupIntro({ onComplete }: StartupIntroProps) {
  const part1 = "Designed by You \n Perfected by AI \n> Delivered by BlackFeel";
  const part2 = "Welcome to THE VOTE";

  const [displayText, setDisplayText] = useState("");
  const [phase, setPhase] = useState<"typingPart1" | "fadeOut" | "typingPart2" | "done">("typingPart1");

  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. CLEAR EVERYTHING ON PHASE CHANGE
    // This stops the "D" glitch and double-typing
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
        if (char === '\n') speed = 800; // Pause for breath at new lines

        timeoutRef.current = setTimeout(typeChar, speed);
      };

      typeChar();
    };

    if (phase === "typingPart1") {
      setDisplayText(""); 
      runTypingLoop(part1, () => setPhase("fadeOut"));
    } 
    else if (phase === "fadeOut") {
      timeoutRef.current = setTimeout(() => {
        setDisplayText(""); 
        setPhase("typingPart2");
      }, 600);
    } 
    else if (phase === "typingPart2") {
      runTypingLoop(part2, () => setPhase("done"));
    }
    else if (phase === "done") {
       timeoutRef.current = setTimeout(onComplete, 1500);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    
  }, [phase, onComplete]);

  // Helper to inject the Blue Glow for "THE VOTE"
  const renderFormattedText = () => {
    const styledText = displayText.replace(
      /(THE VOTE)/g, 
      '<span class="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.9)] font-bold transition-all duration-300">$1</span>'
    );
    return { __html: styledText };
  };

return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-5xl px-8">
        <pre
          // CHANGED: leading-[5] creates the extra breathing room you need between lines.
          className={`font-mono text-3xl md:text-5xl whitespace-pre-wrap leading-[5] tracking-tight text-white text-center font-bold transition-opacity duration-500 ${
            phase === "fadeOut" ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Using dangerouslySetInnerHTML to allow "THE VOTE" to glow blue */}
          <span dangerouslySetInnerHTML={renderFormattedText()} />
          
          {phase !== "done" && (
            <span className="animate-pulse inline-block w-3 h-8 md:w-5 md:h-12 bg-white ml-2 align-middle"></span>
          )}
        </pre>
      </div>
    </div>
  );
}