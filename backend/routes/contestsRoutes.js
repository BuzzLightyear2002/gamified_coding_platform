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
    if (
      user.participatedContests.some(
        (p) => p.contestId.toString() === contestId
      )
    ) {
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
        execCommand = `python3 ${filePath}`;
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

    if (allPassed) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const contest = await Contest.findById(contestId).populate("problems");
      if (!contest) return res.status(404).json({ error: "Contest not found" });

      if (!contest.problems.some((p) => p._id.toString() === problemId)) {
        return res
          .status(400)
          .json({ error: "Invalid problem for this contest" });
      }

      let participation = user.participatedContests.find(
        (p) => p.contestId.toString() === contestId
      );

      if (!participation) {
        return res
          .status(400)
          .json({ error: "User has not participated in this contest" });
      }

      if (participation.solvedProblems.includes(problemId)) {
        return res.status(400).json({ error: "Problem already solved" });
      }

      // ✅ Add problem to solvedProblems
      participation.solvedProblems.push(problemId);

      // ✅ Increase XP for solving a problem
      user.xp.contestsXP += 50; // 50 XP for solving a problem
      user.xp.total += 50; // 50 XP for solving a problem


      // ✅ Check if all contest problems are solved
      const allProblemsSolved = contest.problems.every((p) =>
        participation.solvedProblems.includes(p._id.toString())
      );

      if (allProblemsSolved) {
        participation.completed = true;

        // ✅ Increase XP for completing the contest
        user.xp.contestsXP += 200; // 200 XP for finishing the contest
        user.xp.total += 200; // 200 XP for finishing the contest

      }

      await user.save();
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
