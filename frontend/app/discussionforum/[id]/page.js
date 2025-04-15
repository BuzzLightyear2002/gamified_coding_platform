"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import axios from "axios";

const ThreadViewPage = () => {
  const { user } = useAuth();
  const { id } = useParams();

  const [thread, setThread] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [userVotes, setUserVotes] = useState({}); // Stores user's votes on comments

  useEffect(() => {
    fetchThread();
  }, [user]);

  const fetchThread = async () => {
    if (user === null) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/threads/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setThread(res.data);
      setComments(res.data.comments);
      setLikes(res.data.likes || 0);
      setViews(res.data.views || 0);
      setHasLiked(res.data.likedUsers?.includes(user?._id));
      // Set user's vote status for each comment
      const votes = {};
      res.data.comments.forEach((c) => {
        if (c.votedUsers?.[user?._id]) {
          votes[c._id] = c.votedUsers[user?._id]; // Store 'upvote' or 'downvote'
        }
      });
      setUserVotes(votes);
    } catch (error) {
      console.error("Error fetching thread", error);
    }
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/threads/${id}/like/${user._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setLikes(res.data.likes);
      setHasLiked(res.data.hasLiked); // Set like state to true
    } catch (error) {
      console.error("Error liking thread", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) return;

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/threads/${id}/comment/${user._id}`,
        { content: comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log(res.data);
      setComments(res.data); // Append new comment
      setComment("");
    } catch (error) {
      console.error("Error posting comment", error);
    }
  };
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/threads/${id}/comment/${commentId}/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // Remove the deleted comment from the frontend state
      setComments((prevComments) =>
        prevComments.filter((c) => c._id !== commentId)
      );
    } catch (error) {
      console.error("Error deleting comment", error);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      {thread ? (
        <div>
          <h1 className="text-4xl font-bold text-indigo-950">{thread.title}</h1>
          <Link href={`/profile/${thread.creator._id}`}>
            <div className="flex">
              <p className="text-sm text-gray-500">By {thread.creator.name}</p>
              <img
                        src={thread.creator.avatar || "/default-avatar.png"}
                        alt="User Avatar"
                        className="w-8 h-8 mx-2 rounded-full"
                      />
            </div>
          </Link>
          <p className="text-sm text-gray-500">{thread.summary}</p>

          {/* Likes & Views */}
          <div className="flex items-center gap-4 mt-2">
            <button
              className={`px-4 py-2 rounded-lg ${
                hasLiked ? "bg-red-500" : "bg-gray-300"
              } text-white`}
              onClick={handleLike}
            >
              ❤️ {likes} Likes
            </button>
            <p className="text-gray-500">👀 {views} Views</p>
          </div>

          {/* Comment Input */}
          <textarea
            className="w-full p-2 mt-4 border rounded-lg"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment"
          />
          <button
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={handleCommentSubmit}
          >
            Post Comment
          </button>

          {/* Comments */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold">Comments</h3>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="p-4 my-2 bg-gray-100 rounded-lg flex justify-between"
                >
                  <div>
                    <Link href={`/profile/${comment.creator._id}`}>
                      <div className="font-bold flex">
                      <img
                        src={comment.creator.avatar || "/default-avatar.png"}
                        alt="User Avatar"
                        className="w-8 h-8 mx-2 rounded-full"
                      />
                        {comment.creator.name}
                      </div>
                    </Link>
                    <p>{comment.content}</p>
                  </div>

                  {/* Show delete button only for the comment's creator */}
                  {user?._id === comment.creator?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="px-2 py-1 text-red-500 hover:text-red-700"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No Comments Yet</p>
            )}
          </div>
        </div>
      ) : (
        <p>Loading thread...</p>
      )}
    </div>
  );
};

export default ThreadViewPage;
