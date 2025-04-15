"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // Get logged-in user's ID from auth

  useEffect(() => {
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
  }, []);

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
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead className="bg-slate-600 text-white rounded-lg">
            <tr>
              <th className="py-3 px-4 rounded-l-lg">Rank</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">XP</th>
              <th className="py-3 px-4 rounded-r-lg">Level</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => {
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
                      <span className="font-medium text-indigo-900">{user.name}</span>
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
