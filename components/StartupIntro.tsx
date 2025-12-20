"use client";

import { useState, useEffect, useRef } from "react";

interface StartupIntroProps {
  onComplete: () => void;
}

export default function StartupIntro({ onComplete }: StartupIntroProps) {
  const [displayText, setDisplayText] = useState("");
  
  // 1. Define the two distinct parts of the animation
  const part1 = "Designed by You \n Perfected by AI \n> Delivered by BlackFeel";
  const part2 = "Welcome to THE VOTE";
  
  // Combine them with double newline for visual spacing
  const fullText = `${part1}\n\n${part2}`;
  
  const indexRef = useRef(0);
  const isFinishedRef = useRef(false);

  useEffect(() => {
    // Reset state on mount
    setDisplayText("");
    indexRef.current = 0;
    isFinishedRef.current = false;

    let timeoutId: NodeJS.Timeout;

    const typeCharacter = () => {
      if (indexRef.current < fullText.length) {
        const char = fullText.charAt(indexRef.current);
        
        setDisplayText((prev) => prev + char);
        indexRef.current++;

        // --- SPEED LOGIC ---
        // Requirement 1: 1/2 Speed (Slower)
        // Previous was 30-70ms. Now 60-140ms.
        let nextSpeed = Math.floor(Math.random() * (140 - 60 + 1) + 60);

        // --- PAUSE LOGIC ---
        // Requirement 4: Wait longer before the second paragraph
        // If we just finished typing the last character of part1, pause for a full second.
        if (indexRef.current === part1.length) {
          nextSpeed = 1200; // 1.2 second pause
        }

        timeoutId = setTimeout(typeCharacter, nextSpeed);
      } else if (!isFinishedRef.current) {
        isFinishedRef.current = true;
        
        // Wait 2s after everything is done before redirecting
        timeoutId = setTimeout(() => {
          onComplete();
        }, 2000);
      }
    };

    // Start
    typeCharacter();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onComplete, fullText, part1.length]); 

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-5xl px-8">
        {/* Requirement 2: Font size increased (text-3xl / text-5xl) 
           Requirement 3: Spacing increased (leading-loose) and Centered (text-center)
        */}
        <pre className="font-mono text-3xl md:text-5xl whitespace-pre-wrap leading-loose tracking-tight text-white text-center font-bold">
          {displayText}
          <span className="animate-pulse inline-block w-3 h-8 md:w-5 md:h-12 bg-white ml-2 align-middle"></span>
        </pre>
      </div>
    </div>
  );
}