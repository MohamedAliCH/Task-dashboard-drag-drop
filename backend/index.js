const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/error");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Task Dashboard Backend is alive! 🚀");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/auth", require("./routes/auth"));
app.use('/api/tasks', require('./routes/tasks'));

// Global Error Handler must be after all routes
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle unhandled Promise rejections safely
process.on("unhandledRejection", (err, promise) => {
  console.error(`[UNHANDLED REJECTION] Error: ${err.message}`);
  // In production, might want 'server.close(() => process.exit(1))'
});
