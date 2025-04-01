"use client";

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user]); // Now listens to changes in user

  if (!user) {
    return <GuestNavbar />;
  } else if (role === "admin") {
    return <AdminNavbar logout={logout} />;
  } else {
    return <UserNavbar logout={logout} user={user}/>;
  }
};

const GuestNavbar = () => (
  <nav className="bg-white shadow-md py-4 px-16 flex justify-between items-center">
    <div className="flex gap-7">
      <Link href="/" className="text-xl font-bold text-blue-900">
        Logo
      </Link>
    </div>
    <div className="space-x-4">
      <Link href="/signin" className="text-gray-600 hover:text-gray-900">
        Sign In
      </Link>
      <Link
        href="/signup"
        className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
      >
        Sign Up
      </Link>
    </div>
  </nav>
);

const UserNavbar = ({ logout,user }) => (
  <nav className="bg-white shadow-md py-4 px-16 flex justify-between items-center">
    <div className="flex gap-7">
      <Link href="/" className="text-xl font-bold text-blue-900">
        Logo
      </Link>
      <div className="flex gap-7 mt-1 items-center">
        <Link href="/problemset" className="text-gray-600 hover:text-gray-900">
          Problem Set
        </Link>
        <Link href="/contests" className="text-gray-600 hover:text-gray-900">
          Contest
        </Link>
        <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900">
          Leaderboard
        </Link>
        <Link
          href="/discussionforum"
          className="text-gray-600 hover:text-gray-900"
        >
          Discussion
        </Link>
      </div>
    </div>
    <Link
          href={`/profile/${user._id}`}
          className="text-gray-600 hover:text-gray-900 text-right grow mx-2"
        >
          {user.name}
        </Link>
    <button onClick={logout} className="text-gray-600 hover:text-gray-900">
      Logout
    </button>
  </nav>
);

const AdminNavbar = ({ logout }) => (
  <nav className="bg-white shadow-md py-4 px-16 flex justify-between items-center">
    <div className="flex gap-7">
      <Link href="/" className="text-xl font-bold text-blue-900">
        Logo
      </Link>
      <div className="flex gap-7 mt-1 items-center">
        <Link href="/admin/problems" className="text-gray-600 hover:text-gray-900">
          Manage Problems
        </Link>
        <Link href="/admin/contests" className="text-gray-600 hover:text-gray-900">
          Manage Contest
        </Link>
      </div>
    </div>
    <button onClick={logout} className="text-gray-600 hover:text-gray-900">
      Logout
    </button>
  </nav>
);

export default Navbar;
