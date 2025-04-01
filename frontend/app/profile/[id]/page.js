"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext"; // Assuming AuthContext stores logged-in user info

const ProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [friendStatus, setFriendStatus] = useState(null); // New state for friend status
  const [requests, setRequests] = useState([]); // Track incoming friend requests
  const [editData, setEditData] = useState({ name: "", bio: "", avatar: "" });

  const { user: loggedInUser } = useAuth(); // Get the logged-in user from context
  const isOwnProfile = loggedInUser && loggedInUser._id === id; // Check if profile belongs to logged-in user

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/profile/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(res.data);
        setUser(res.data);
        setEditData({
          name: res.data.name,
          bio: res.data.bio,
          avatar: res.data.avatar,
        });

        // Fetch friend status
        const friendRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/friends/list/${loggedInUser._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const requestRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/friends/requests/${loggedInUser._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRequests(requestRes.data.friendRequests);

        if (friendRes.data.friends.some((friend) => friend._id === id)) {
          setFriendStatus("friends");
        } else if (
          requestRes.data.friendRequests.some(
            (request) => request._id === loggedInUser._id
          )
        ) {
          setFriendStatus("pending");
        } else {
          setFriendStatus("not_friends");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUser) fetchUser();
  }, [loggedInUser]);

  // Send Friend Request
  const sendFriendRequest = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friends/request/${loggedInUser._id}/${user._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFriendStatus("pending");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  // Accept Friend Request
  const acceptFriendRequest = async (friendId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friends/accept/${loggedInUser._id}/${friendId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests(requests.filter((req) => req._id !== friendId));
      setFriendStatus("friends");
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  // Decline Friend Request
  const declineFriendRequest = async (friendId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friends/decline/${loggedInUser._id}/${friendId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests(requests.filter((req) => req._id !== friendId));
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/friends/remove`,
        { friendId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove friend from UI
      setUser((prev) => ({
        ...prev,
        friends: prev.friends.filter(
          (friend) => friend._id !== loggedInUser._id
        ),
      }));
      setFriendStatus("not_friends");
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const handleEdit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setIsEditing(false);
      location.reload();
      setLoading(true);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) return <p className="text-center mt-6 text-lg">Loading...</p>;
  if (!user)
    return (
      <p className="text-center mt-6 text-lg text-red-500">User not found</p>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6 border">
      {/* User Info */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Image
          src={user.avatar || "/default-avatar.png"}
          alt="Profile"
          width={100}
          height={100}
          className="rounded-full border-4 border-gray-300"
        />
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-gray-500">{user.bio || "No bio yet"}</p>

          {isOwnProfile ? (
            // Show "Edit Profile" button only if user is viewing their own profile
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 px-4 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            >
              Edit Profile
            </button>
          ) : (
            <>
              {friendStatus === "friends" ? (
                <>
                  <button className="mt-2 px-4 py-1 text-sm text-white bg-gray-500 rounded-md">
                    Friends ✅
                  </button>
                  <button
                    onClick={handleRemoveFriend}
                    className="mt-2 px-4 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md"
                  >
                    Remove Friend
                  </button>
                </>
              ) : friendStatus === "pending" ? (
                <button className="mt-2 px-4 py-1 text-sm text-gray-700 bg-yellow-400 rounded-md">
                  Request Sent ⏳
                </button>
              ) : (
                <button
                  className="mt-2 px-4 py-1 text-sm text-white bg-green-500 hover:bg-green-600 rounded-md"
                  onClick={sendFriendRequest}
                >
                  Add Friend
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* XP Bar */}
      <div className="mt-6">
        <div className="text-sm font-medium">
          Level {`${Math.floor((user.xp.total + 100) / 100)}`}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 relative">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${((user.xp.total % 100) / 100) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Achievements & Badges */}
      {/* <div className="mt-6">
        <h3 className="text-lg font-semibold">Achievements</h3>
        <div className="flex gap-3 flex-wrap mt-2">
          {user.achievements.length > 0 ? (
            user.achievements.map((badge, index) => (
              <div
                key={index}
                className="p-2 bg-gray-100 text-sm rounded-lg border"
              >
                {badge}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No achievements yet</p>
          )}
        </div>
      </div> */}

{/* Coding Activity */}
<div className="mt-6">
<h3 className="text-lg font-semibold">Coding Activity</h3>
  <div className="mt-2 space-y-2 text-gray-600">
    <p>
      ✅ <>Solved Problems:</>{" "}
      <span className="font-semibold">
        {user.codingStats.solvedQuestions} Problems
      </span>
    </p>
    <p>
      🏆 <>Contests Participated:</>{" "}
      <span className="font-semibold">
        {user.participatedContests.length} Contests
      </span>
    </p>
    <p>
      🎯 <>Contests Completed:</>{" "}
      <span className="font-semibold">
        {
          user.participatedContests.filter((e) => e.completed === true).length
        }{" "}
        Contests
      </span>
    </p>
    <p>
      🧩 <>Problems Solved in Contests:</>{" "}
      <span className="font-semibold">
        {user.participatedContests.reduce(
          (sum, contest) => sum + contest.solvedProblems.length,
          0
        )}{" "}
        Problems
      </span>
    </p>
    <p>
      👥 <>Friends:</>{" "}
      <span className="font-semibold">{user.friends.length} Friends</span>
    </p>
  </div>
</div>


      {/* Friend Requests Section */}
      {isOwnProfile && requests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Friend Requests</h3>
          <div className="flex flex-col gap-3 mt-2">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
              >
                <p>{req.name}</p>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-sm text-white bg-green-500 rounded-md"
                    onClick={() => acceptFriendRequest(req._id)}
                  >
                    Accept
                  </button>
                  <button
                    className="px-3 py-1 text-sm text-white bg-red-500 rounded-md"
                    onClick={() => declineFriendRequest(req._id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Friends</h3>
        <div className="flex gap-3 flex-wrap mt-2">
          {user.friends && user.friends.length > 0 ? (
            user.friends.map((friend) => (
              <Link key={friend._id} href={`/profile/${friend._id}`}>
                <div className=" bg-gray-100 text-sm rounded-lg flex text-center justify-center items-center border">
                  <Image
                    src={friend.avatar || "/default-avatar.png"}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full m-1 border-4 border-gray-300"
                  />
                  {friend.name}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500">No friends yet</p>
          )}
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Favorite Questions</h3>
          <div className="flex gap-3 flex-wrap mt-2">
            {user.favorites.savedQuestions &&
            user.favorites.savedQuestions.length > 0 ? (
              user.favorites.savedQuestions.map((question, index) => (
                <Link key={index} href={`/problemset/${question._id}`}>
                  <div className="p-2 bg-gray-100 text-sm rounded-lg border">
                    {question.title}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No favorite questions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && isOwnProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
            <input
              type="text"
              className="w-full border p-2 rounded mb-2"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              placeholder="Enter Name"
            />
            <textarea
              className="w-full border p-2 rounded mb-2"
              value={editData.bio}
              onChange={(e) =>
                setEditData({ ...editData, bio: e.target.value })
              }
              placeholder="Enter Bio"
            ></textarea>
            <input
              type="text"
              className="w-full border p-2 rounded mb-2"
              value={editData.avatar}
              onChange={(e) =>
                setEditData({ ...editData, avatar: e.target.value })
              }
              placeholder="Avatar URL"
            />
            <div className="flex justify-between mt-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
