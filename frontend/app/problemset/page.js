"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaRegStar, FaStar } from "react-icons/fa";

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [favoriteProblems, setFavoriteProblems] = useState(new Set());
  const [personalisedProblems, setPersonalisedProblems] = useState([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [filteredProblems, setFilteredProblems] = useState([]);

  const [selectedTab, setSelectedTab] = useState("All"); // "All", "Completed", "Personalized"

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "user") {
      router.replace("/");
      return;
    }

    fetchProblems();
    fetchPersonalisedProblems();
    fetchFavorites();
  }, [user, loading]);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/code`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setProblems(res.data);
    } catch (error) {
      console.error("Error fetching problems", error);
    }
  };

  const fetchPersonalisedProblems = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/code/personalised-problems`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setPersonalisedProblems(res.data);
    } catch (error) {
      console.error("Error fetching personalized problems", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/favorites/get`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setFavoriteProblems(new Set(res.data.savedQuestions));
    } catch (error) {
      console.error("Error fetching favorite problems", error);
    }
  };

  const toggleFavorite = async (problemId) => {
    try {
      const isFavorited = favoriteProblems.has(problemId);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/users/favorites/${
        isFavorited ? "remove" : "add"
      }`;

      await axios.post(
        url,
        { problemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setFavoriteProblems((prev) => {
        const updated = new Set(prev);
        isFavorited ? updated.delete(problemId) : updated.add(problemId);
        return updated;
      });
    } catch (error) {
      console.error("Error updating favorite problems", error);
    }
  };

  useEffect(() => {
    let filtered = problems;

    if (search) {
      filtered = filtered.filter((problem) =>
        problem.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (difficulty !== "All") {
      filtered = filtered.filter((problem) => problem.difficulty === difficulty);
    }

    if (selectedTab === "Completed") {
      filtered = filtered.filter((problem) => problem.completed);
    }

    if (selectedTab === "Personalized") {
      filtered = personalisedProblems;
    }

    if (selectedTab === "Saved") {
      filtered = filtered.filter((problem) => favoriteProblems.has(problem._id));
    }

    setFilteredProblems(filtered);
  }, [search, difficulty, problems, personalisedProblems, selectedTab, favoriteProblems]);

  return (
    <div className="p-16 mx-auto">
      <div className="">
        <h1 className="text-4xl p-8 text-center font-bold mb-4 text-indigo-950">
          Problem Set
        </h1>
        <p className="text-base text-center mb-4 text-indigo-950">
          Solve problems and improve your coding skills. Save your favorite problems for later!
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col mt-16 sm:flex-row justify-between mb-4 gap-3">
        <input
          type="text"
          placeholder="Search by title..."
          className="w-full sm:w-2/3 px-3 py-2 border rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="w-full sm:w-1/3 px-3 py-2 border rounded-lg"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {["All", "Completed", "Personalized", "Saved"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              selectedTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Problem List */}
      <ul className="gap-6 grid grid-cols-2">
        {filteredProblems.map((problem) => (
          <li
            key={problem._id}
            className="relative group p-4 rounded-lg hover:bg-gray-50 border hover:border-indigo-100 transition flex justify-between items-center"
          >
            <a href={`/problemset/${problem._id}`} className="block w-full">
              <h3 className="text-lg text-indigo-950 font-semibold">{problem.title}</h3>
              <p
                className={`text-sm font-semibold ${
                  problem.difficulty === "Easy"
                    ? "text-green-300"
                    : problem.difficulty === "Medium"
                    ? "text-yellow-300"
                    : "text-red-300"
                }`}
              >
                {problem.difficulty}
              </p>

              {selectedTab === "Personalized" ? (
                <p className="text-green-600 text-md font-bold">
                  {problem.matchingTags?.join(", ")}
                </p>
              ) : (
                <p className="text-blue-950 text-xs">{problem.tags.join(", ")}</p>
              )}

              {problem.completed && (
                <span className="text-green-600 font-bold">✔ Completed</span>
              )}
            </a>
            <button
              onClick={() => toggleFavorite(problem._id)}
              className="absolute top-2 right-2 text-xl text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {favoriteProblems.has(problem._id) ? <FaStar /> : <FaRegStar />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProblemsPage;
