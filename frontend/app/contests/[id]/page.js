"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const ContestDetailPage = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [hasParticipated, setHasParticipated] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [contestCompleted, setContestCompleted] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait for auth state to load completely

    if (!user || user.role !== "user") {
      router.push("/");
      return;
    }

    fetchContestDetails();
  }, [user]);

  const fetchContestDetails = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contests/${id}`
      );
      setContest(res.data);

      // Check if user is in participants list
      if (res.data.participants.includes(user._id)) {
        setHasParticipated(true);
      }
      // Extract participation details from user object
      const participation = user.participatedContests.find(
        (p) => p.contestId === id
      );
      if (participation) {
        setSolvedProblems(participation.solvedProblems);
        setContestCompleted(participation.completed);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleParticipation = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contests/participate`,
        { contestId: id, userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setHasParticipated(true); // Update UI state
              toast.success("You have Joined the Contest!");
      
    } catch (error) {
      console.error("Error participating in contest:", error);
    }
  };

  if (!contest)
    return (
      <div className="text-center text-indigo-600 text-xl font-bold mt-10">
        Loading Contest...
      </div>
    );
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-indigo-900 mb-4">
        {contest.name}
      </h1>
      {contestCompleted && (
        <p className="text-green-700 font-bold mt-4">
          ✅ You have completed this contest!
        </p>
      )}          <p className="text-gray-600 text-sm mt-1">
      🕒 Start:
      {new Date(contest.startTime).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })} | ⏳ {contest.duration}
    </p>
      <p className="mt-4 text-lg text-gray-700">{contest.description}</p>

      {!hasParticipated ? (
        <button
          onClick={handleParticipation}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Participate in Contest
        </button>
      ) : (
        <>
          <h2 className="mt-6 text-2xl font-semibold text-indigo-900">
            Problems:
          </h2>
          <ul className="mt-4 grid gap-4">
            {contest.problems.map((problem) => {
              const isSolved = solvedProblems.includes(problem._id);
              return (
                <li
                  key={problem._id}
                  className={`p-4 border rounded-lg shadow-md transition ${
                    isSolved
                      ? "bg-green-100 border-green-500"
                      : "bg-white border-indigo-100"
                  }`}
                >
                  <Link
                    href={`/contests/${id}/${problem._id}`}
                    className="block"
                  >
                    <h3 className="text-lg font-semibold text-indigo-900">
                      {problem.title} {isSolved && "✅"}
                    </h3>
                    <p
                      className={`text-sm font-semibold ${
                        problem.difficulty === "Easy"
                          ? "text-green-500"
                          : problem.difficulty === "Medium"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {problem.difficulty}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default ContestDetailPage;
