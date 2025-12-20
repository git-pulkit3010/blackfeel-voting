"use client";

import { useState, useEffect } from "react";
import MinimalistDuel from "@/components/MinimalistDuel";
import StartupIntro from "@/components/StartupIntro";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  // OPTIONAL: Prevent animation from playing on every single refresh
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    // Remember that the user saw the intro
    sessionStorage.setItem("hasSeenIntro", "true");
    setShowIntro(false);
  };

  if (showIntro) {
    return <StartupIntro onComplete={handleIntroComplete} />;
  }

  return <MinimalistDuel />;
}