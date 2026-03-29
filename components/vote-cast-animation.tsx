"use client";

import { useEffect, useRef, useState } from "react";

interface VoteCastAnimationProps {
  onComplete: () => void;
  showImmediately?: boolean;
  userEmail?: string | null;
  onSignOut?: () => Promise<void>;
}

export default function VoteCastAnimation({
  onComplete,
  showImmediately = false,
  userEmail,
  onSignOut,
}: VoteCastAnimationProps) {
  const message = "Your Vote Has Been Cast";
  const [displayText, setDisplayText] = useState(showImmediately ? message : "");
  const [phase, setPhase] = useState<"typing" | "done">(showImmediately ? "done" : "typing");
  const [showControls, setShowControls] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase === "done") {
      onComplete();
      // Show controls after animation completes
      setTimeout(() => setShowControls(true), 500);
      return;
    }

    indexRef.current = 0;
    setDisplayText("");

    const typeChar = () => {
      const currentIndex = indexRef.current;

      if (currentIndex >= message.length) {
        timeoutRef.current = setTimeout(() => {
          setPhase("done");
        }, 1200);
        return;
      }

      const char = message.charAt(currentIndex);
      setDisplayText((prev) => prev + char);
      indexRef.current += 1;

      let speed = Math.floor(Math.random() * (110 - 55 + 1) + 55);
      if (char === " ") speed = 140;
      timeoutRef.current = setTimeout(typeChar, speed);
    };

    timeoutRef.current = setTimeout(typeChar, 120);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [message, onComplete, phase]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white">
      {/* Sign Out Button - Top Right */}
      {showControls && (
        <div className="absolute top-4 right-4 z-[101] flex items-center gap-3">
          {userEmail && (
            <span className="text-text-secondary text-sm">{userEmail}</span>
          )}
          <button
            onClick={onSignOut}
            className="px-4 py-2 text-sm font-medium text-text-secondary border border-border-dark rounded-lg hover:text-white hover:border-gray-500 transition-all"
          >
            Sign Out
          </button>
        </div>
      )}

      <div className="w-full max-w-5xl px-8">
        <pre className="font-mono text-4xl md:text-6xl whitespace-pre-wrap leading-tight text-white text-center font-bold">
          {displayText}
          {phase !== "done" && (
            <span className="animate-pulse inline-block w-3 h-8 md:w-5 md:h-12 bg-white ml-2 align-middle" />
          )}
        </pre>

        {/* Additional message after typing completes */}
        {showControls && (
          <div className="mt-12 text-center">
            <p className="text-text-secondary text-lg mb-6">
              Thank you for voting! Your opinion matters.
            </p>
            <p className="text-text-secondary text-sm">
              You can sign out above or close this tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
