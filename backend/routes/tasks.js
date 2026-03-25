const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/Task");

router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error: " + err.message);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { title, description, priority, due, status } = req.body;
    const task = new Task({
      title,
      description: description || "",
      priority,
      due: due || "No due date",
      status: status || "todo",
      user: req.user.id,
    });
    await task.save();
    res.json(task);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

router.put("/:id", auth, async (req, res) => {
  const { title, description, priority, due, status } = req.body;
  try {
    const { id } = req.params;
    let task = await Task.findById(id);
    if (!task) return res.status(404).json({ msg: "Task not found" });
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    task = await Task.findByIdAndUpdate(
      id,
      { title, description, priority, due, status },
      { new: true },
    );
    res.json(task);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: "Task removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
