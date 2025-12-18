"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Trend, Category } from "@/types";

const CATEGORIES: Category[] = [
  { id: "tv-shows", name: "TV Shows" },
  { id: "movies", name: "Movies" },
  { id: "cricket", name: "Cricket" },
  { id: "anime", name: "Anime" },
  { id: "music", name: "Music" },
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
        body: JSON.stringify({
          trendId: currentTrend.id,
          choice,
        }),
      });

      if (response.ok) {
        const updatedTrend = await response.json();
        setTrends((prev) => ({
          ...prev,
          [currentCategory.id]: updatedTrend,
        }));

        // Auto-advance to next category after voting
        setTimeout(() => {
          nextCategory();
        }, 1500);
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setVoting(false);
    }
  };

  const nextCategory = () => {
    setCurrentCategoryIndex((prev) => (prev + 1) % CATEGORIES.length);
  };

  const previousCategory = () => {
    setCurrentCategoryIndex((prev) => (prev - 1 + CATEGORIES.length) % CATEGORIES.length);
  };

  const getVotePercentage = (votesA: number, votesB: number, option: "a" | "b") => {
    const total = votesA + votesB;
    if (total === 0) return 50;
    return option === "a" ? Math.round((votesA / total) * 100) : Math.round((votesB / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-50 text-xl">Loading trends...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,zinc-800_1px,transparent_1px),linear-gradient(to_bottom,zinc-800_1px,transparent_1px)] bg-[size:20px_20px]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(39, 39, 42, 0.1) 0%, transparent 70%),
            linear-gradient(to_right, #27272a 1px, transparent 1px),
            linear-gradient(to_bottom, #27272a 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px, 100% 100%'
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-zinc-50 mb-2">Trend Vote</h1>
          <p className="text-zinc-400 text-lg">Help us choose the next winning design</p>
        </motion.div>

        {/* Category indicator */}
        <div className="flex gap-2 mb-8">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setCurrentCategoryIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentCategoryIndex
                  ? "w-12 bg-zinc-50"
                  : "w-2 bg-zinc-50/30 hover:bg-zinc-50/50"
              }`}
            />
          ))}
        </div>

        {/* Main duel card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory.id}
            initial={{ x: 300, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -300, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-4xl"
          >
            <Card className="border border-zinc-800">
              <CardContent className="p-12">
                {/* Category name */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.2, ease: "easeOut" }}
                  className="text-3xl font-bold text-zinc-50 text-center mb-12"
                >
                  {currentCategory.name}
                </motion.h2>

                {currentTrend ? (
                  <div className="space-y-8">
                    {/* VS indicator */}
                    <div className="flex items-center justify-center gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={() => handleVote("a")}
                          disabled={voting}
                          size="lg"
                          className="w-full h-32 text-xl font-semibold bg-white text-black border border-zinc-800 hover:bg-zinc-200"
                        >
                          {currentTrend.option_a}
                        </Button>
                        <div className="text-center mt-3 text-zinc-400 text-sm font-mono">
                          {getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "a")}% ({currentTrend.votes_a} votes)
                        </div>
                      </motion.div>

                      <div className="text-4xl font-black text-zinc-50/30">VS</div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={() => handleVote("b")}
                          disabled={voting}
                          size="lg"
                          className="w-full h-32 text-xl font-semibold bg-white text-black border border-zinc-800 hover:bg-zinc-200"
                        >
                          {currentTrend.option_b}
                        </Button>
                        <div className="text-center mt-3 text-zinc-400 text-sm font-mono">
                          {getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "b")}% ({currentTrend.votes_b} votes)
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-zinc-400 py-12">
                    No trends available for this category yet
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={previousCategory}
            variant="ghost"
            className="text-zinc-50 hover:bg-zinc-800 border border-zinc-800"
          >
            ← Previous
          </Button>
          <Button
            onClick={nextCategory}
            variant="ghost"
            className="text-zinc-50 hover:bg-zinc-800 border border-zinc-800"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}