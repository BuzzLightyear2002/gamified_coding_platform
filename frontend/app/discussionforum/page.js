"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const DiscussionForumPage = () => {
  const [threads, setThreads] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [filteredThreads, setFilteredThreads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    summary: "",
    category: "",
  });

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "user") {
      router.replace("/");
      return;
    }
    fetchThreads();
  }, [user, loading]);

  const fetchThreads = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/threads`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setThreads(res.data);
    } catch (error) {
      console.error("Error fetching threads", error);
    }
  };
  useEffect(() => {
    let filtered = threads;

    if (search) {
      filtered = filtered.filter((thread) =>
        thread.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "All") {
      filtered = filtered.filter((thread) => thread.category === category);
    }

    setFilteredThreads(filtered);
  }, [search, category, threads]);

  const handleCreatePost = async () => {
    try {
      if (newPost.category === "") {
        toast.error("Please Select Category");
        return;
      }
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/threads/${user._id}`,
        { ...newPost },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      toast.success("Thread Created!");

      setThreads([res.data, ...threads]);
      setShowModal(false);
      location.reload();

    } catch (error) {
      console.error("Error creating post", error);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!window.confirm("Are you sure you want to delete this thread?")) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/threads/${threadId}/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      toast("Thread Deleted!");

      // Remove the deleted thread from the frontend state
      setThreads((prevThreads) =>
        prevThreads.filter((t) => t._id !== threadId)
      );
    } catch (error) {
      console.error("Error deleting thread", error);
    }
  };

  return (
    <div className="p-16 mx-auto">
      <div className="">
        <h1 className="text-4xl p-8 text-center font-bold mb-4 text-indigo-950">
          Discussion Forum
        </h1>
        <p className="text-base text-center mb-4 text-indigo-950">
          Discuss, Chat and brainstorm about the problems.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col mt-16 sm:flex-row justify-between mb-4 gap-3">
        <input
          type="text"
          placeholder="Search by topic..."
          className="w-full  px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="w-full sm:w-1/3 px-3 py-2 border rounded-lg"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Algorithms">Algorithms</option>
          <option value="Data Structures">Data Structures</option>
          <option value="Web Development">Web Development</option>
        </select>
      </div>

      {/* Create Post Button */}
      <div className="flex justify-center m-6">
        <button
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          onClick={() => setShowModal(true)}
        >
          <FaPlus className="mr-2" />
          Create Post
        </button>
      </div>

      {/* Threads List */}
      <ul className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredThreads.map((thread) => (
          <li
            key={thread._id}
            className="relative flex flex-col p-4 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-indigo-200 transition duration-300 ease-in-out"
          >
            {/* Delete button positioned in the top-right corner */}
            {user?._id === thread.creator?._id && (
              <button
                onClick={() => handleDeleteThread(thread._id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-2 14H7L5 7m3 0V3a2 2 0 012-2h6a2 2 0 012 2v4M10 7h4"
                  />
                </svg>
              </button>
            )}

            {/* Content Section */}
            <div className="flex flex-col h-full justify-between">
              <Link
                href={`/discussionforum/${thread._id}`}
                className="flex flex-col w-full mb-4"
              >
                <h3 className="text-lg text-indigo-950 font-semibold hover:text-indigo-700 transition">
                  {thread.title}
                </h3>
                <p className="text-sm text-gray-700 mt-1">{thread.summary}</p>
              </Link>

              {/* Bottom Information (always at the bottom) */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                  <img
                    src={thread.creator.avatar || "/default-avatar.png"}
                    alt="User Avatar"
                    className="w-8 h-8 mx-2 rounded-full"
                  />
                  <p className="text-xs text-gray-500">{thread.creator.name}</p>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <p>{thread.likes} Likes</p>
                  <p>{thread.views} Views</p>
                  <p>{thread.replies} Replies</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal for Creating Post */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full sm:w-1/2">
            <h2 className="text-2xl font-semibold mb-4">Create a New Post</h2>
            <input
              type="text"
              placeholder="Post Title"
              className="w-full p-2 border rounded-lg mb-4"
              value={newPost.title}
              onChange={(e) =>
                setNewPost({ ...newPost, title: e.target.value })
              }
            />
            <textarea
              placeholder="Post Summary"
              className="w-full p-2 border rounded-lg mb-4"
              value={newPost.summary}
              onChange={(e) =>
                setNewPost({ ...newPost, summary: e.target.value })
              }
            />
            <select
              className="w-full p-2 border rounded-lg mb-4"
              value={newPost.category}
              onChange={(e) =>
                setNewPost({ ...newPost, category: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              <option value="Algorithms">Algorithms</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Web Development">Web Development</option>
            </select>
            <div className="flex justify-between">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                onClick={handleCreatePost}
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionForumPage;
