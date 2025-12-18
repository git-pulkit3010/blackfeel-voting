"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Trend, Category } from "@/types";

const CATEGORIES: Category[] = [
  { id: "tv-shows", name: "TV Shows", gradient: "from-purple-500 via-pink-500 to-red-500" },
  { id: "movies", name: "Movies", gradient: "from-blue-500 via-cyan-500 to-teal-500" },
  { id: "cricket", name: "Cricket", gradient: "from-green-500 via-emerald-500 to-lime-500" },
  { id: "anime", name: "Anime", gradient: "from-orange-500 via-amber-500 to-yellow-500" },
  { id: "music", name: "Music", gradient: "from-indigo-500 via-purple-500 to-pink-500" },
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-white text-xl">Loading trends...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategory.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 bg-gradient-to-br ${currentCategory.gradient} opacity-20`}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2">Trend Vote</h1>
          <p className="text-gray-400 text-lg">Help us choose the next winning design</p>
        </motion.div>

        {/* Category indicator */}
        <div className="flex gap-2 mb-8">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setCurrentCategoryIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentCategoryIndex
                  ? "w-12 bg-white"
                  : "w-2 bg-white/30 hover:bg-white/50"
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
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="w-full max-w-4xl"
          >
            <Card className="border-2 border-white/20">
              <CardContent className="p-12">
                {/* Category name */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-white text-center mb-12"
                >
                  {currentCategory.name}
                </motion.h2>

                {currentTrend ? (
                  <div className="space-y-8">
                    {/* VS indicator */}
                    <div className="flex items-center justify-center gap-6">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={() => handleVote("a")}
                          disabled={voting}
                          size="lg"
                          className="w-full h-32 text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-2 border-blue-400"
                        >
                          {currentTrend.option_a}
                        </Button>
                        <div className="text-center mt-3 text-gray-400 text-sm">
                          {getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "a")}% ({currentTrend.votes_a} votes)
                        </div>
                      </motion.div>

                      <div className="text-4xl font-black text-white/30">VS</div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={() => handleVote("b")}
                          disabled={voting}
                          size="lg"
                          className="w-full h-32 text-xl font-semibold bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white border-2 border-pink-400"
                        >
                          {currentTrend.option_b}
                        </Button>
                        <div className="text-center mt-3 text-gray-400 text-sm">
                          {getVotePercentage(currentTrend.votes_a, currentTrend.votes_b, "b")}% ({currentTrend.votes_b} votes)
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
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
            className="text-white hover:bg-white/10"
          >
            ← Previous
          </Button>
          <Button
            onClick={nextCategory}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}