"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";

const ContestsPage = () => {
  const [contests, setContests] = useState([]);
  const [contestCompleted, setContestCompleted] = useState([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  const [showJoined, setShowJoined] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (loading) return;

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

      const updatedContests = res.data.map((contest) => ({
        ...contest,
        hasParticipated: contest.participants.includes(user._id),
      }));

      setContests(updatedContests);

      const completed = user.participatedContests
        .filter((e) => e.completed === true)
        .map((e) => e.contestId);

      setContestCompleted(completed);
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
      toast.success("You have Joined the Contest!");

      setContests((prev) =>
        prev.map((contest) =>
          contest._id === contestId
            ? { ...contest, hasParticipated: true }
            : contest
        )
      );
    } catch (error) {
      console.error("Error participating in contest", error);
    }
  };

  const filteredContests = contests
  .filter((c) => {
    if (showCompleted) return contestCompleted.includes(c._id);
    if (showJoined) return c.hasParticipated;
    return true;
  })
  .filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="p-16 mx-auto">
      <div className="">
        <h1 className="text-4xl p-8 text-center font-bold mb-4 text-indigo-950">
        Coding Contests
        </h1>
        <p className="text-base text-center mb-4 text-indigo-950">
        Participate in coding battles, earn XP, and climb the leaderboard!

        </p>
      </div>

      <div className="flex flex-col mt-16 sm:flex-row justify-between mb-4 gap-3">
        <input
          type="text"
          placeholder="Search contests..."
          className="w-full  px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />


      </div>


      <div className="flex gap-4 mb-6">
  <button
    onClick={() => {
      setShowJoined(false);
      setShowCompleted(false);
    }}
    className={`px-4 py-2 rounded-lg border ${
      !showJoined && !showCompleted
        ? "bg-indigo-600 text-white"
        : "bg-gray-100"
    }`}
  >
    All
  </button>
  <button
    onClick={() => {
      setShowJoined(true);
      setShowCompleted(false);
    }}
    className={`px-4 py-2 rounded-lg border ${
      showJoined && !showCompleted
        ? "bg-indigo-600 text-white"
        : "bg-gray-100"
    }`}
  >
    Joined
  </button>
  <button
    onClick={() => {
      setShowJoined(false);
      setShowCompleted(true);
    }}
    className={`px-4 py-2 rounded-lg border ${
      showCompleted ? "bg-indigo-600 text-white" : "bg-gray-100"
    }`}
  >
    Completed
  </button>
</div>


      {filteredContests.length === 0 ? (
        <p className="text-center text-gray-500">No contests found.</p>
      ) : (
        <ul className="gap-6 grid grid-cols-2">
          {filteredContests.map((contest) => (
  <Link key={contest._id} href={`/contests/${contest._id}`}>
    <li
      className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition cursor-pointer hover:bg-gray-50"
    >
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-indigo-900">
            {contest.name}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            🕒 Start:{" "}
            {new Date(contest.startTime).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p className="text-gray-600 text-sm">
            ⏳ Duration: {contest.duration}
          </p>

          {contestCompleted.includes(contest._id) ? (
            <p className="mt-3 text-green-700 font-semibold">
              ✅ Completed
            </p>
          ) : contest.hasParticipated ? (
            <p className="mt-3 text-blue-600 font-semibold">
              ✅ Joined
            </p>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault(); // prevent Link navigation
                participateInContest(contest._id);
              }}
              className="mt-3 bg-indigo-700 hover:bg-indigo-800 text-white text-sm px-4 py-2 rounded"
            >
              Enter Contest
            </button>
          )}
        </div>
      </div>
    </li>
  </Link>
))}

        </ul>
      )}
    </div>
  );
};

export default ContestsPage;
