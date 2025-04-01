"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [favoriteProblems, setFavoriteProblems] = useState(new Set()); // Store favorite problems
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth state to load completely
  
    if (!user || user.role !== "user") {
      router.replace("/"); // Redirect only if user is null after loading
      return;
    }
  
    fetchProblems();
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

      if (isFavorited) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/favorites/remove`,
          { problemId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/favorites/add`,
          { problemId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
      }

      // Update UI instantly
      setFavoriteProblems((prevFavorites) => {
        const updatedFavorites = new Set(prevFavorites);
        if (isFavorited) {
          updatedFavorites.delete(problemId);
        } else {
          updatedFavorites.add(problemId);
        }
        return updatedFavorites;
      });
    } catch (error) {
      console.error("Error updating favorite problems", error);
    }
  };

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [filteredProblems, setFilteredProblems] = useState([]);

  useEffect(() => {
    let filtered = problems;

    if (search) {
      filtered = filtered.filter((problem) =>
        problem.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (difficulty !== "All") {
      filtered = filtered.filter(
        (problem) => problem.difficulty === difficulty
      );
    }

    setFilteredProblems(filtered);
  }, [search, difficulty, problems]);

  return (
    <div className="p-16 mx-auto">
      <div className="">
        <h1 className="text-4xl p-8 text-center font-bold mb-4 text-indigo-950">
          Problem Set
        </h1>
        <p className="text-base text-center mb-4 text-indigo-950">
          Solve problems and improve your coding skills. Save your favorite
          problems for later!
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

      {/* Problem List */}
      <ul className="gap-6 grid grid-cols-2">
        {filteredProblems.map((problem) => (
          <li
            key={problem._id}
            className="p-4 rounded-lg hover:bg-gray-50 border hover:border-indigo-100 transition flex justify-between items-center"
          >
            <a href={`/problemset/${problem._id}`} className="block w-full">
              <h3 className="text-lg text-indigo-950 font-semibold">
                {problem.title}
              </h3>
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
              <p className="text-blue-950 text-xs">{problem.tags.join(", ")}</p>
              {problem.completed && (
                <span className="text-green-600 font-bold">✔ Completed</span>
              )}
            </a>
            <button
              className={`ml-4 px-3 py-2 rounded-lg text-sm ${
                favoriteProblems.has(problem._id)
                  ? "bg-red-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
              onClick={() => toggleFavorite(problem._id)}
            >
              {favoriteProblems.has(problem._id) ? "Unsave" : "Save"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProblemsPage;
