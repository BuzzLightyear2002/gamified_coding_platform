const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const codeRoutes = require("./routes/codeRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contestRoutes = require("./routes/contestsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const threadRoutes = require("./routes/threadRoutes");
const friendRoutes = require("./routes/friendRoutes"); // Import friend routes
const leaderboardRoutes = require("./routes/leaderboardRoutes"); // Import friend routes

dotenv.config();

const app = express();
app.use(express.json());
const allowedOrigins = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/friends", friendRoutes); // Register friend routes
app.use("/api/leaderboard", leaderboardRoutes);
// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
