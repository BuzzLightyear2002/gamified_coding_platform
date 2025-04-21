const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);
const Contest = require("../models/Contest");
const User = require("../models/User");
const Problem = require("../models/Problem");
const { authenticate } = require("../middleware/authMiddleware");

// ✅ Get all contests with problems populated
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming user ID is available from authentication middleware

    const contests = await Contest.find().populate("problems"); // Populating problems directly in the contest data

    const user = await User.findById(userId);
    const participatedContests = user.participatedContests || [];
    const participatedContestsIds = participatedContests.map((e) =>
      e._id.toString()
    );
    // Add participation status to each contest
    const contestsWithStatus = contests.map((contest) => ({
      ...contest.toObject(),
      hasParticipated: participatedContestsIds.includes(contest._id.toString()),
    }));

    res.json(contestsWithStatus);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching contests", error: error.message });
  }
});

// Get contest details with problems populated
router.get("/:id", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("problems"); // Populating problems directly in the contest data

    if (!contest) return res.status(404).json({ error: "Contest not found" });

    res.json(contest);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/participate", async (req, res) => {
  try {
    const { contestId, userId } = req.body; // Get contest & user ID

    // Check if contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ error: "Contest not found" });

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if the user already participated
    if (user.participatedContests.some((p) => p._id.toString() === contestId)) {
      return res
        .status(400)
        .json({ error: "Already participated in this contest" });
    }

    // Add contest to user's participated contests
    user.participatedContests.push({
      contestId,
      solvedProblems: [],
      completed: false,
    });

    // Increase XP for participation
    user.xp.total += 10; // ✅ 10 XP for joining a contest
    user.xp.contestsXP += 10; // ✅ 10 XP for joining a contest

    await user.save();

    // Add user to contest's participants
    contest.participants.push(userId);
    await contest.save();

    res.json({ message: "Successfully joined the contest", contestId });
  } catch (error) {
    console.error("Error joining contest:", error);
    res.status(500).json({ error: "Error participating in contest" });
  }
});

router.post("/submit", async (req, res) => {
  const { userId, contestId, problemId, language, code } = req.body;

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
        execCommand = `python ${filePath}`;
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
            console.log(firstInput);
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

    let allProblemsSolved = false;
    let xpAwarded = false;
    let xpAmount = 0;
    let contestXpAwarded = false;

    if (allPassed) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const contest = await Contest.findById(contestId).populate("problems");
      if (!contest) return res.status(404).json({ error: "Contest not found" });

      // Make sure this problem belongs to the contest
      if (!contest.problems.some((p) => p._id.toString() === problemId)) {
        return res
          .status(400)
          .json({ error: "Invalid problem for this contest" });
      }

      // Get or validate the user's participation
      const participation = user.participatedContests.find(
        (p) => p.contestId.toString() === contestId
      );

      if (!participation) {
        return res
          .status(400)
          .json({ error: "User has not participated in this contest" });
      }

      // Prevent double-counting XP for same problem
      if (participation.solvedProblems.includes(problemId)) {
        return res.status(400).json({ error: "Problem already solved" });
      }

      // ✅ Update XP and progress
      participation.solvedProblems.push(problemId);
      user.xp.contestsXP += 50;
      user.xp.total += 50;
      xpAwarded = true;
      xpAmount = 50;

      // ✅ Check if all contest problems are solved
      allProblemsSolved = contest.problems.every((p) =>
        participation.solvedProblems.includes(p._id.toString())
      );

      if (allProblemsSolved) {
        participation.completed = true;
        user.xp.contestsXP += 200;
        user.xp.total += 200;
        contestXpAwarded = true;
      }

      await user.save();
    }

    // Send XP info to frontend
    return res.json({
      correct: allPassed,
      message: allPassed ? "Correct Answer!" : "Wrong Answer!",
      output: testCaseResults,
      xpAwarded,
      xpAmount,
      contestXpAwarded,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
