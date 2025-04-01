"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const ContestsPage = () => {
  const [contests, setContests] = useState([]);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [contestCompleted, setContestCompleted] = useState([]);

  useEffect(() => {
    if (loading) return; // Wait for auth state to load completely

    if (!user || user.role !== "user") {
      router.push("/");
      return;
    }
    fetchContests();
  }, [user, loading]);

  const fetchContests = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contests`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setContests(res.data);
      // Update the participation status in state
      setContests(
        res.data.map((contest) =>
          contest.participants.includes(user._id)
            ? { ...contest, hasParticipated: true }
            : contest
        )
      );
      // Extract participation details from user object
      const participations = user.participatedContests
        .filter((e) => e.completed === true) // Keep only completed contests
        .map((e) => e.contestId); // Extract only the `_id` values
      if (participations) {
        setContestCompleted(participations);
      }
    } catch (error) {
      console.error("Error fetching contests", error);
    }
  };

  const participateInContest = async (contestId) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contests/participate`,
        { contestId, userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // Update the participation status in state
      setContests((prevContests) =>
        prevContests.map((contest) =>
          contest._id === contestId
            ? { ...contest, hasParticipated: true }
            : contest
        )
      );
    } catch (error) {
      console.error("Error participating in contest", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-center text-indigo-900 mb-8">
        Coding Contests
      </h1>

      <ul className="grid gap-6">
        {contests.map((contest) => (
          <li
            key={contest._id}
            className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition border border-indigo-100"
          >
            <h2 className="text-2xl font-semibold text-indigo-950">
              {contest.name}
            </h2>
            <p className="text-gray-600 mt-1">
              🕒 {contest.startTime} | ⏳ {contest.duration}
            </p>
            {contestCompleted.includes(contest._id) ? (
              <>
                <p className="text-green-700 font-bold mt-4">
                  ✅ You have completed this contest!
                </p>
              </>
            ) : (
              <>
                {contest.hasParticipated ? (
                  <p className="mt-4 text-green-600 font-semibold">
                    ✅ You have joined this contest!
                  </p>
                ) : (
                  <button
                    onClick={() => participateInContest(contest._id)}
                    className="mt-4 bg-indigo-900 text-white px-4 py-2 rounded-lg hover:bg-indigo-950"
                  >
                    Enter Contest
                  </button>
                )}
              </>
            )}

            <Link href={`/contests/${contest._id}`} className="block mt-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                View Contest
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContestsPage;
