"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button, Table, TableHead, TableBody, TableRow, TableCell, Typography, Container, TextField, Select, MenuItem, InputLabel, FormControl, Box, Collapse } from "@mui/material";

const AdminProblems = () => {
  const [problems, setProblems] = useState([]);
  const [newProblem, setNewProblem] = useState({
    title: "",
    difficulty: "",
    description: "",
    tags: "",
    expectedInput: "",
    expectedOutput: "",
    testCases: [{ input: "", output: "" }],
  });
  const [openAddForm, setOpenAddForm] = useState(false); // State to toggle form visibility
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }
    fetchProblems();
  }, [user]);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/problems`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setProblems(res.data);
    } catch (error) {
      console.error("Error fetching problems", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProblem({ ...newProblem, [name]: value });
  };

  const handleTestCaseChange = (e, index) => {
    const { name, value } = e.target;
    const updatedTestCases = [...newProblem.testCases];
    updatedTestCases[index] = { ...updatedTestCases[index], [name]: value };
    setNewProblem({ ...newProblem, testCases: updatedTestCases });
  };

  const addTestCase = () => {
    setNewProblem({
      ...newProblem,
      testCases: [...newProblem.testCases, { input: "", output: "" }],
    });
  };

  const deleteProblem = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/problems/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      fetchProblems();
    } catch (error) {
      console.error("Error deleting problem", error);
    }
  };

  const submitProblem = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/problems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(newProblem),
      });

      if (res.ok) {
        setNewProblem({
          title: "",
          difficulty: "",
          description: "",
          tags: "",
          expectedInput: "",
          expectedOutput: "",
          testCases: [{ input: "", output: "" }],
        });
        fetchProblems(); // Refresh the problem list
      } else {
        console.error("Error adding problem");
      }
    } catch (error) {
      console.error("Error adding problem", error);
    }
  };

  return (
    <Container className="m-8">
      <Typography variant="h4" mb={4}>Manage Problems</Typography>

      <Button
        onClick={() => setOpenAddForm(!openAddForm)}
        variant="contained"
        sx={{ mb: 4 }}
      >
        {openAddForm ? "Cancel Add Problem" : "Add New Problem"}
      </Button>

      <Collapse in={openAddForm}>
        <Box mb={4}>
          <Typography variant="h6">Add New Problem</Typography>
          <TextField
            label="Title"
            name="title"
            fullWidth
            value={newProblem.title}
            onChange={handleInputChange}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Difficulty</InputLabel>
            <Select
              label="Difficulty"
              name="difficulty"
              value={newProblem.difficulty}
              onChange={handleInputChange}
            >
              <MenuItem value="Easy">Easy</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Hard">Hard</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Description"
            name="description"
            fullWidth
            value={newProblem.description}
            onChange={handleInputChange}
            margin="normal"
            multiline
          />
          <TextField
            label="Tags (comma separated)"
            name="tags"
            fullWidth
            value={newProblem.tags}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            label="Expected Input"
            name="expectedInput"
            fullWidth
            value={newProblem.expectedInput}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            label="Expected Output"
            name="expectedOutput"
            fullWidth
            value={newProblem.expectedOutput}
            onChange={handleInputChange}
            margin="normal"
          />
          <Typography variant="subtitle1">Test Cases</Typography>
          {newProblem.testCases.map((testCase, index) => (
            <Box key={index} mb={2}>
              <TextField
                label={`Test Case #${index + 1} Input`}
                name="input"
                fullWidth
                value={testCase.input}
                onChange={(e) => handleTestCaseChange(e, index)}
                margin="normal"
              />
              <TextField
                label={`Test Case #${index + 1} Output`}
                name="output"
                fullWidth
                value={testCase.output}
                onChange={(e) => handleTestCaseChange(e, index)}
                margin="normal"
              />
            </Box>
          ))}
          <Button
            onClick={addTestCase}
            variant="outlined"
            color="primary"
          >
            Add Test Case
          </Button>
          <Button
            onClick={submitProblem}
            variant="contained"
            color="primary"
          >
            Submit New Problem
          </Button>
        </Box>
      </Collapse>

      <Table className="w-full table-auto bg-white rounded-lg shadow-md">
  <TableHead className="text-lg font-semibold text-gray-700 bg-blue-50">
    <TableRow>
      <TableCell className="py-3 px-4 text-left">Title</TableCell>
      <TableCell className="py-3 px-4 text-left">Difficulty</TableCell>
      <TableCell className="py-3 px-4 text-left">Actions</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {problems.map((problem) => (
      <TableRow
        key={problem._id}
        className="border-t border-gray-200 hover:bg-gray-100 transition-all"
      >
        <TableCell className="py-3 px-4 text-gray-800">{problem.title}</TableCell>
        <TableCell className="py-3 px-4 text-gray-600">{problem.difficulty}</TableCell>
        <TableCell className="py-3 px-4">
          <Button
            onClick={() => deleteProblem(problem._id)}
            color="error"
            className="bg-red-500 hover:bg-red-700 hover:text-white py-2 px-4 rounded transition-all"
          >
            Delete
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

    </Container>
  );
};

export default AdminProblems;
