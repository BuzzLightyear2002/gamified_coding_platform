"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // Get logged-in user's ID from auth
  const { user } = useAuth();
  const { loading: load } = useAuth();

  useEffect(() => {
    if (load) return;

    if (!user || user.role !== "user") {
      router.push("/");
      return;
    }
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard`
        );
        setLeaderboard(res.data.users);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user, load]);

  return (
    <div className="p-16 mx-auto">
      <div className="">
        <h1 className="text-4xl p-8 text-center font-bold mb-4 text-indigo-950">
          Leaderboard
        </h1>
        <p className="text-base text-center mb-4 text-indigo-950">
          Compare, Compete and Grow in the leaderboard section.
        </p>
      </div>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="mt-16 mb-4 overflow-x-auto">
          <div className="flex gap-4">
            <button
              onClick={() => setShowFriendsOnly(!showFriendsOnly)}
              className={`px-4 py-2 rounded border ${
                showFriendsOnly ? "bg-indigo-600 text-white" : "bg-gray-100"
              }`}
            >
              {showFriendsOnly ? "Showing Friends" : "All Users"}
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className={`px-4 py-2 rounded border ${
                showStats ? "bg-indigo-600 text-white" : "bg-gray-100"
              }`}
            >
              {showStats ? "Hide Stats" : "Show Stats"}
            </button>
          </div>
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead className="bg-slate-600 text-white rounded-lg">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Rank</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">XP</th>
                <th className="py-3 px-4">Level</th>
                {showStats && (
                  <>
                    <th className="py-3 px-4 rounded-r-lg">Stats</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {leaderboard
                .filter(
                  (user1) =>
                    !showFriendsOnly ||
                    user1.friends?.includes(user._id) ||
                    user1._id === user._id
                )
                .map((user, index) => {
                  const isCurrentUser = user._id === userId;

                  const getRankStyle = (idx) => {
                    switch (idx) {
                      case 0:
                        return "bg-yellow-100 border-l-4 border-yellow-400";
                      case 1:
                        return "bg-gray-100 border-l-4 border-gray-400";
                      case 2:
                        return "bg-orange-100 border-l-4 border-orange-400";
                      default:
                        return "bg-white";
                    }
                  };

                  return (
                    <tr
                      key={user._id}
                      className={`rounded-lg shadow-sm ${getRankStyle(index)} ${
                        isCurrentUser ? "ring-2 ring-indigo-400" : ""
                      } transition hover:scale-[1.01]`}
                    >
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        #{index + 1}
                      </td>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <Link
                          href={`/profile/${user._id}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <img
                            src={user.avatar || "/default-avatar.png"}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-300"
                          />
                          <span className="font-medium text-indigo-900">
                            {user.name}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-semibold">
                          {user.xp.total} XP
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                          Level {Math.floor((user.xp.total + 100) / 100)}
                        </span>
                      </td>
                      {showStats && (
                        <td
                          colSpan={4}
                          className="pt-1 pb-3 px-4 text-sm text-gray-700"
                        >
                          ✅ Solved Problems:{" "}
                          {user.codingStats.solvedProblemIds?.length || 0}{" "}
                          Problems
                          <br />
                          🏆 Contests Participated:{" "}
                          {user.participatedContests?.length || 0} Contests
                          <br />
                          🎯 Contests Completed:{" "}
                          {
                            user.participatedContests.filter(
                              (e) => e.completed === true
                            ).length
                          }{" "}
                          Contests
                          <br />
                          🧩 Problems Solved in Contests:{" "}
                          {user.participatedContests.reduce(
                            (sum, contest) =>
                              sum + contest.solvedProblems.length,
                            0
                          )}{" "}
                          Problems
                          <br />
                          👥 Friends: {user.friends?.length || 0} Friends
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
