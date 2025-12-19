"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Trend, Category } from "@/types";

const CATEGORIES: Category[] = [
  { id: "tv-shows", name: "TV Shows", gradient: "" },
  { id: "movies", name: "Movies", gradient: "" },
  { id: "cricket", name: "Cricket", gradient: "" },
  { id: "anime", name: "Anime", gradient: "" },
  { id: "music", name: "Music", gradient: "" },
];

export default function MinimalistDuel() {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [trends, setTrends] = useState<Record<string, Trend>>({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const currentCategory = CATEGORIES[currentCategoryIndex];
  const currentTrend = trends[currentCategory.id];

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const response = await fetch("/api/trends");
      const data = await response.json();
      setTrends(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trends:", error);
      setLoading(false);
    }
  };

  const handleVote = async (choice: "a" | "b") => {
    if (!currentTrend || voting) return;
    setVoting(true);
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendId: currentTrend.id, choice }),
      });
      if (response.ok) {
        const updatedTrend = await response.json();
        setTrends((prev) => ({ ...prev, [currentCategory.id]: updatedTrend }));
        setTimeout(() => nextCategory(), 1500);
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setVoting(false);
    }
  };

  const nextCategory = () => setCurrentCategoryIndex((prev) => (prev + 1) % CATEGORIES.length);
  const previousCategory = () => setCurrentCategoryIndex((prev) => (prev - 1 + CATEGORIES.length) % CATEGORIES.length);

  const getVotePercentage = (votesA: number, votesB: number, option: "a" | "b") => {
    const total = votesA + votesB;
    if (total === 0) return 50;
    return option === "a" ? Math.round((votesA / total) * 100) : Math.round((votesB / total) * 100);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-dark font-display">
      {/* Header */}
      <header className="text-center mb-10 w-full max-w-lg mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-text-primary">Trend Vote</h1>
        <p className="text-text-secondary font-medium text-sm md:text-base">Help us choose the next winning design</p>
        
        {/* Category Indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {CATEGORIES.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentCategoryIndex(idx)}
              className={`cursor-pointer transition-colors rounded-full ${
                idx === currentCategoryIndex ? "h-1.5 w-8 bg-white" : "h-1.5 w-1.5 bg-gray-800 hover:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Main Duel Card */}
      <main className="w-full max-w-5xl bg-card-dark border border-border-dark rounded-xl p-6 md:p-12 shadow-2xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-text-primary tracking-wide">
              {currentCategory.name}
            </h2>

            {currentTrend ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 relative z-10">
                {/* Option A */}
                <div className="flex-1 w-full flex flex-col items-center group">
                  <button
                    disabled={voting}
                    onClick={() => handleVote("a")}
                    className="w-full aspect-video bg-[#09090b] rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center relative overflow-hidden border border-border-dark focus:border-accent-blue focus:outline-none ring-2 ring-transparent focus:ring-accent-blue/50 ring-offset-2 ring-offset-black"
                  >
                    {currentTrend.option_a_image_url && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 filter brightness-75"
                        style={{ backgroundImage: `url('${currentTrend.option_a_image_url}')` }}
                      ></div>
                    )}
                    <span className="z-10 text-xl md:text-2xl font-bold tracking-tight px-4 text-center text-text-primary">
                      {currentTrend.option_a}
                    </span>
                  </button>
                  <div className="mt-4 flex flex-col items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="font-mono text-xs font-medium text-text-secondary tracking-wider">
                      {getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "a")}% ({currentTrend.votes_a} votes)
                    </div>
                    <div className="w-24 h-1 bg-gray-800 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "a") >= getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "b")
                            ? "bg-accent-blue"
                            : "bg-text-tertiary"
                        }`} 
                        style={{ width: `${getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "a")}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="shrink-0 flex items-center justify-center">
                  <span className="text-5xl md:text-6xl font-black text-gray-900 select-none italic tracking-tighter transform skew-x-[-10deg]">
                    VS
                  </span>
                </div>

                {/* Option B */}
                <div className="flex-1 w-full flex flex-col items-center group">
                  <button
                    disabled={voting}
                    onClick={() => handleVote("b")}
                    className="w-full aspect-video bg-[#09090b] rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center relative overflow-hidden border border-border-dark focus:border-accent-blue focus:outline-none ring-2 ring-transparent focus:ring-accent-blue/50 ring-offset-2 ring-offset-black"
                  >
                    {currentTrend.option_b_image_url && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 filter brightness-75"
                        style={{ backgroundImage: `url('${currentTrend.option_b_image_url}')` }}
                      ></div>
                    )}
                    <span className="z-10 text-xl md:text-2xl font-bold tracking-tight px-4 text-center text-text-primary">
                      {currentTrend.option_b}
                    </span>
                  </button>
                  <div className="mt-4 flex flex-col items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className="font-mono text-xs font-medium text-text-secondary tracking-wider">
                      {getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "b")}% ({currentTrend.votes_b} votes)
                    </div>
                    <div className="w-24 h-1 bg-gray-800 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "b") >= getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "a")
                            ? "bg-accent-blue"
                            : "bg-text-tertiary"
                        }`} 
                        style={{ width: `${getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "b")}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-text-secondary">No trends available for this category.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="mt-12 flex items-center gap-6">
        <button
          onClick={previousCategory}
          className="group px-6 py-3 rounded-lg border border-border-dark hover:bg-card-dark hover:border-gray-600 transition-all duration-200 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <span className="material-icons text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Previous
        </button>
        <button
          onClick={nextCategory}
          className="group px-6 py-3 rounded-lg border border-border-dark hover:bg-card-dark hover:border-gray-600 transition-all duration-200 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          Next
          <span className="material-icons text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </nav>
    </div>
  );
}