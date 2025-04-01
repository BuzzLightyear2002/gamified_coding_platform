"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Button,
  Typography,
  Container,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  SelectChangeEvent,
} from "@mui/material";

const AdminContests = () => {
  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [newContest, setNewContest] = useState({
    name: "",
    startTime: "",
    description: "",
    duration: "",
    problems: [],
  });
  const [showAddContestForm, setShowAddContestForm] = useState(false); // state to toggle form visibility
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }
    fetchContests();
    fetchProblems();
  }, [user]);

  const fetchContests = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/contests`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await res.json();
      setContests(data);
    } catch (error) {
      console.error("Error fetching contests", error);
    }
  };

  const fetchProblems = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/problems`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await res.json();
      setProblems(data); // Set the available problems
    } catch (error) {
      console.error("Error fetching problems", error);
    }
  };

  const deleteContest = async (id) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/contests/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      fetchContests();
    } catch (error) {
      console.error("Error deleting contest", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContest({ ...newContest, [name]: value });
  };

  const handleProblemChange = (event) => {
    const selectedProblemIds = event.target.value;
    const selectedProblems = selectedProblemIds.map((id) =>
      problems.find((problem) => problem._id === id)
    ); // map ids to problem objects
    setNewContest({ ...newContest, problems: selectedProblems });
  };

  const submitContest = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/contests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(newContest),
        }
      );

      if (res.ok) {
        // Clear the form and fetch the contests again
        setNewContest({ name: "", startTime: "", duration: "", problems: [] });
        fetchContests();
        setShowAddContestForm(false); // Hide form after submission
      } else {
        console.error("Error adding contest");
      }
    } catch (error) {
      console.error("Error adding contest", error);
    }
  };

  return (
    <Container className="m-8">
      <Typography variant="h4" mb={4} className="text-gray-800">
        Manage Contests
      </Typography>

      {/* Button to toggle "Add New Contest" form visibility */}
      <Button
        onClick={() => setShowAddContestForm(!showAddContestForm)}
        variant="contained"
        color="primary"
        sx={{ mb: 4 }}
      >
        {showAddContestForm ? "Cancel" : "Add New Contest"}
      </Button>

      {/* Add New Contest Form */}
      {showAddContestForm && (
        <Box mb={4} className="bg-white p-4 rounded-lg shadow-md">
          <Typography variant="h6" mb={2}>
            Add New Contest
          </Typography>

          <TextField
            label="Contest Name"
            name="name"
            fullWidth
            value={newContest.name}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            label="Start Time"
            name="startTime"
            type="datetime-local"
            fullWidth
            value={newContest.startTime}
            onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            value={newContest.description}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            label="Duration"
            name="duration"
            fullWidth
            value={newContest.duration}
            onChange={handleInputChange}
            margin="normal"
          />

          {/* Problems Dropdown */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="problems-label">Problems</InputLabel>
            <Select
              labelId="problems-label"
              id="problems"
              multiple
              value={newContest.problems.map((problem) => problem._id)} // display selected problem ids
              onChange={handleProblemChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                  {selected.map((id) => {
                    const problem = problems.find((p) => p._id === id);
                    return (
                      <Chip
                        key={id}
                        label={problem?.title}
                        sx={{ margin: 0.5 }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {problems.map((problem) => (
                <MenuItem key={problem._id} value={problem._id}>
                  {problem.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            onClick={submitContest}
            variant="contained"
            color="primary"
            className="mt-4"
          >
            Submit New Contest
          </Button>
        </Box>
      )}

      {/* Contest List */}
      <Box mb={4}>
        <Table className="w-full table-auto bg-white rounded-lg shadow-md">
          <TableHead className="text-lg font-semibold text-gray-700 bg-blue-50">
            <TableRow>
              <TableCell className="py-3 px-4 text-left">Name</TableCell>
              <TableCell className="py-3 px-4 text-left">Start Time</TableCell>
              <TableCell className="py-3 px-4 text-left">Duration</TableCell>
              <TableCell className="py-3 px-4 text-left">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contests.map((contest) => (
              <TableRow
                key={contest._id}
                className="border-t border-gray-200 hover:bg-gray-100 transition-all"
              >
                <TableCell className="py-3 px-4 text-gray-800">
                  {contest.name}
                </TableCell>
                <TableCell className="py-3 px-4 text-gray-600">
                  {new Date(contest.startTime).toLocaleString()}
                </TableCell>
                <TableCell className="py-3 px-4 text-gray-600">
                  {contest.duration}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Button
                    onClick={() => deleteContest(contest._id)}
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
      </Box>
    </Container>
  );
};

export default AdminContests;
