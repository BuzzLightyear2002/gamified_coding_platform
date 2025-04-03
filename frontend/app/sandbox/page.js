"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Assuming AuthContext stores logged-in user info
import axios from "axios";
import { CodeBlock, dracula } from "react-code-blocks";

const ProblemDetails = () => {
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [runOutput, setRunOutput] = useState(""); // Separate state for run output
  const [fetching, setFetching] = useState(false); // "run" or "submit"

  const [language, setLanguage] = useState("javascript");
  const { user: loggedInUser } = useAuth(); // Get the logged-in user from context


  async function runCode() {
    setFetching(true);
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/code/run`,
      {
        language,
        code,
      }
    );
    setRunOutput(res.data.output);
    setFetching(false); // Store output in runOutput state
  }

 



  return (
    <div className="max-w-4xl mx-auto py-10 px-6 bg-white mb-2 mt-2 ">
      {/* Problem Title */}
      <h1 className="text-3xl font-extrabold text-indigo-900 mb-4">
        Sandbox
      </h1>

      {/* Problem Description */}
      <p className="text-lg text-gray-700"></p>

      {/* Expected Input/Output */}
      <div className="bg-indigo-50 p-4 rounded-lg mt-6 border-l-4 border-indigo-500">
        <p className="text-indigo-800 font-semibold">
          <strong>🔹 Code Anything Code Everything</strong> 
        </p>
        <p className="text-green-800 font-semibold mt-1">
          <strong>🔹 Compiler on the Go</strong> 
        </p>
      </div>

      {/* Code Editor */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        {/* Language Selector */}
        <label className="block font-semibold text-gray-800">
          Select Language:
        </label>
        <select
          className="p-2 border rounded-lg w-full bg-gray-50 mt-1 text-gray-700"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="C#">C#</option>
        </select>

        {/* Code Input */}
        <textarea
          className="w-full h-40 p-3 border mt-3 rounded-lg bg-gray-900 text-green-400 font-mono whitespace-pre-wrap"
          placeholder="// Write your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={runCode}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ▶ Run Code
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-md">
        {/* Tab Buttons */}
        <div className="flex border-b">
          <button
            className="px-4 py-2 bg-indigo-500 text-white"
          >
            🔹 Run Output
          </button>
        </div>

        {/* Output Content */}
        <div className="p-4">
          <h3 className="font-bold text-indigo-900">🔹 Run Output:</h3>
          {fetching ? (
            <>
              <CodeBlock
                text={"Fetching the Result..."}
                language={language}
                theme={dracula}
              />
            </>
          ) : (
            <>
              {" "}
              <CodeBlock
                text={runOutput || "No run output yet"}
                language={language}
                theme={dracula}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetails;
