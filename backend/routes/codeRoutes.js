const express = require("express");
const axios = require('axios');
const fs = require("fs");
const User = require("../models/User");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);
const Problem = require("../models/Problem"); // Import the Problem model
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Get problem details
router.get("/:id", async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id); // Find the problem by ID
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//Get all problems
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract user ID from auth middleware
    const user = await User.findById(userId).select(
      "codingStats.solvedProblemIds"
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    const problems = await Problem.find();

    // Mark problems as completed if they exist in user's solvedProblemIds
    const updatedProblems = problems.map((problem) => ({
      ...problem.toObject(),
      completed: user.codingStats.solvedProblemIds.includes(
        problem._id.toString()
      ),
    }));

    res.json(updatedProblems);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Run code

router.post("/run", async (req, res) => {
  const { language, code } = req.body;

  if (!code) return res.json({ output: "No code provided" });

  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  let command = "";
  let tempFilePath = "";

  if (language === "javascript") {
    tempFilePath = path.join(tempDir, "temp_script.js");
    fs.writeFileSync(tempFilePath, code);
    command = `node ${tempFilePath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        res.json({ output: stderr || error.message });
      } else {
        res.json({ output: stdout });
      }
    });
  } else if (language === "python") {
    tempFilePath = path.join(tempDir, "temp_script.py");
    fs.writeFileSync(tempFilePath, code);
    command = `python3 ${tempFilePath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        res.json({ output: stderr || error.message });
      } else {
        res.json({ output: stdout });
      }
    });
  } else if (language === "C#") {
    // Instead of executing locally, call the external API for C# execution
    try {
      // Call your external API for C# code execution
      const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        "language": "csharp",
        "version": "5", 
        "files": [
          {
            "name": "main.cs",
            "content": code
          }
        ],
      });

      // Return the output from the API response
      if (response.data && response.data.run) {
        res.json({ output: response.data.run.output });
      } else {
        res.json({ output: "Error executing C# code" });
      }
    } catch (error) {
      console.log(error);
      res.json({ output: error.message });
    }
  } else {
    return res.json({ output: "Unsupported language" });
  }
});

router.post("/submit/:id", async (req, res) => {
  const { problemId, language, code } = req.body;

  try {
    if (!code || !code.trim()) {
      return res.status(400).json({ error: "No code submitted" });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const testCases = problem.testCases;
    if (!testCases || testCases.length === 0) {
      return res
        .status(400)
        .json({ error: "No test cases available for this problem" });
    }

    let testCaseResults = [];

    // Ensure a proper temp directory
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    // Check if the function exists in the provided code
    let functionName = null;

    if (language === "javascript") {
      const matchJSFunction = code.match(/function\s+(\w+)\s*\(/);
      const matchJSArrow = code.match(/const\s+(\w+)\s*=\s*\(/);
      functionName = matchJSFunction
        ? matchJSFunction[1]
        : matchJSArrow
        ? matchJSArrow[1]
        : null;
    } else if (language === "python") {
      const matchPython = code.match(/def\s+(\w+)\s*\(/);
      functionName = matchPython ? matchPython[1] : null;
    } else if (language === "C#") {
      const matchCSFunction =
        code.match(/void\s+(\w+)\s*\(/) || code.match(/public\s+(\w+)\s*\(/);
      functionName = matchCSFunction ? matchCSFunction[1] : null;
    }
    if (!functionName) {
      return res
        .status(400)
        .json({ error: "No valid function found in the submitted code" });
    }

    // Run test cases in sequence
    for (let index = 0; index < testCases.length; index++) {
      const test = testCases[index];
      let filePath, execCommand, testCode;

      if (language === "javascript") {
        filePath = path.join(tempDir, `test_case_${index}.js`);
        testCode = `${code}\nconsole.log(${functionName}(${test.input}));`;
        execCommand = `node ${filePath}`;
      } else if (language === "python") {
        filePath = path.join(tempDir, `test_case_${index}.py`);
        testCode = `${code}\nprint(${functionName}(${test.input}))`;
        execCommand = `python3 ${filePath}`;
      } else if (language === "C#") {
        filePath = path.join(tempDir, `test_case_${index}.cs`);

        let modifiedCode = code;
        testCode = modifiedCode;

        try {
          // Match the array part (e.g., [2, 7, 11, 15])
          let arrayMatches = [...test.input.matchAll(/\[.*?\]/g)]; // Get all arrays
          let extractedArrays = arrayMatches.map((match) => match[0]); // Extract matched arrays as strings

          let numberMatch = test.input.replace(/\[.*?\]/g, "").trim(); // Remove arrays from input
          numberMatch = numberMatch.replace(/^,|,$/g, "").trim(); // Remove leading/trailing commas

          if (extractedArrays.includes(numberMatch)) {
            numberMatch = null;
          }

          let inputParts = [];

          // If the array part is found, push it as an object for C# format
          if (extractedArrays && extractedArrays.length > 0) {
            extractedArrays.forEach((array) => {
              inputParts.push(array);
            });
          }

          // If there's a number after the array, push it to the parts
          if (numberMatch) {
            // Trim any spaces and split by commas
            const numbers = numberMatch.split(",").map((num) => num.trim());

            // Push each number separately into inputParts
            inputParts.push(...numbers);
          }
          // Process the inputs
          if (inputParts.length === 1) {
            let parsedInput;
            const firstInput = inputParts[0];
            if (typeof firstInput === "string") {
              try {
                // Try parsing only if it looks like a JSON array or number
                if (firstInput.startsWith("[") && firstInput.endsWith("]")) {
                  parsedInput = JSON.parse(firstInput); // Parse array
                } else if (!isNaN(Number(firstInput))) {
                  parsedInput = Number(firstInput); // Convert to number
                } else {
                  parsedInput = `"${firstInput}"`; // Keep as string
                }
              } catch (error) {
                parsedInput = firstInput; // Fallback to original string
              }
            } else {
              parsedInput = firstInput; // If already a number, assign directly
            }

            if (Array.isArray(parsedInput)) {
              // If it's an array, format as {2, 7, 11, 15} for C#
              const inputObjectString = `{${parsedInput.join(",")}}`;
              testCode = modifiedCode.replace(/INPUT/g, inputObjectString);
            } else {
              // If it's a single number, replace INPUT with the number
              testCode = modifiedCode.replace(/INPUT/g, parsedInput);
            }
          } else {
            // Multiple inputs like [2, 7, 11, 15] and 9
            inputParts.forEach((input, index) => {
              let parsedInput = JSON.parse(input);
              if (Array.isArray(parsedInput)) {
                // If it's an array, format as {2, 7, 11, 15} for C#
                const inputObjectString = `{${parsedInput.join(",")}}`;
                testCode = testCode.replace(
                  new RegExp(`INPUT${index + 1}`, "g"),
                  inputObjectString
                );
              } else {
                testCode = testCode.replace(
                  new RegExp(`INPUT${index + 1}`, "g"),
                  parsedInput
                );
              }
            });
          }
        } catch (error) {
          console.error("Error parsing input:", error);
          return res.status(400).json({ error: "Invalid input format" });
        }

        const exePath = filePath.replace(".cs", ".exe");
        execCommand = `mcs -nologo -out:${exePath} ${filePath} && mono ${exePath}`;
      } else {
        return res.status(400).json({ error: "Unsupported language" });
      }

      fs.writeFileSync(filePath, testCode);

      try {
        const { stdout, stderr } = await execPromise(execCommand);

        if (stderr) {
          testCaseResults.push({
            testCase: index + 1,
            result: `Error: ${stderr.trim()}`,
          });
        } else {
          const output = stdout.trim();
          testCaseResults.push(
            output === test.output
              ? { testCase: index + 1, result: "Passed" }
              : {
                  testCase: index + 1,
                  result: `Failed (Expected: ${test.output}, Got: ${output})`,
                }
          );
        }
      } catch (error) {
        testCaseResults.push({
          testCase: index + 1,
          result: `Runtime Error: ${error.message}`,
        });
      }
    }

    // Check if all test cases passed
    const allPassed =
      testCaseResults.length > 0 &&
      testCaseResults.every((result) => result.result === "Passed");

    // Update User Stats if all tests pass
    if (allPassed) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Check if the user has already solved this problem
      const alreadySolved =
        user.codingStats.solvedProblemIds.includes(problemId);

      if (!alreadySolved) {
        user.xp.total += 50;
        user.xp.problemsSolvedXP += 50;
        user.codingStats.solvedQuestions += 1;
        user.codingStats.solvedProblemIds.push(problemId);
        await user.save();
      }
    }

    return res.json({
      success: allPassed,
      message: allPassed ? "Correct Answer!" : "Wrong Answer!",
      output: testCaseResults,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


module.exports = router;

