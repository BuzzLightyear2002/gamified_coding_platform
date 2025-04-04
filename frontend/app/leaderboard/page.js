
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // Get logged-in user's ID from auth

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard`);
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center">🏆 Leaderboard</h1>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-2 px-4 text-left">Rank</th>
                <th className="py-2 px-4 text-left">User</th>
                <th className="py-2 px-4 text-left">XP</th>
                <th className="py-2 px-4 text-left">Level</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, index) => (
                <Link href={`/profile/${user._id}`}>
                <tr
                  key={user._id}
                  className={`border-b ${
                    user._id === userId ? "bg-yellow-100 font-bold" : ""
                  }`}
                >
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4 flex items-center gap-2">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    {user.name}
                  </td>
                  <td className="py-2 px-4">{user.xp.total}</td>
                  <td className="py-2 px-4">{`${Math.floor((user.xp.total+100)/100)}`}</td>
                </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
