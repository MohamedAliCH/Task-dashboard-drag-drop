require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Task = require("./models/Task");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = new Date();

function daysFromToday(n) {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

// ─── Sample tasks ─────────────────────────────────────────────────────────────

const TASKS = [
  // ── To Do ────────────────────────────────────────────────────────────────
  {
    title: "Set up CI/CD pipeline for the project",
    priority: "high",
    due: daysFromToday(2),
    status: "todo",
  },
  {
    title: "Write unit tests for the auth routes",
    priority: "high",
    due: daysFromToday(3),
    status: "todo",
  },
  {
    title: "Design the onboarding flow mockups",
    priority: "medium",
    due: daysFromToday(5),
    status: "todo",
  },
  {
    title: "Research competitor pricing models",
    priority: "medium",
    due: daysFromToday(7),
    status: "todo",
  },
  {
    title: "Add dark mode support to the dashboard",
    priority: "low",
    due: daysFromToday(10),
    status: "todo",
  },
  {
    title: "Update project README with setup instructions",
    priority: "low",
    due: "No due date",
    status: "todo",
  },
  {
    title: "Fix pagination bug on the tasks list",
    priority: "high",
    due: daysFromToday(1),
    status: "todo",
  },
  {
    title: "Integrate email notification service",
    priority: "medium",
    due: daysFromToday(8),
    status: "todo",
  },

  // ── In Progress ───────────────────────────────────────────────────────────
  {
    title: "Build the Kanban drag-and-drop board",
    priority: "high",
    due: daysFromToday(0), // due today
    status: "inProgress",
  },
  {
    title: "Implement JWT refresh token logic",
    priority: "high",
    due: daysFromToday(2),
    status: "inProgress",
  },
  {
    title: "Migrate database to new MongoDB Atlas cluster",
    priority: "medium",
    due: daysFromToday(4),
    status: "inProgress",
  },
  {
    title: "Redesign the user profile page",
    priority: "medium",
    due: daysFromToday(6),
    status: "inProgress",
  },
  {
    title: "Add input validation to all API endpoints",
    priority: "high",
    due: daysFromToday(-1), // overdue
    status: "inProgress",
  },
  {
    title: "Write API documentation with Swagger",
    priority: "low",
    due: daysFromToday(9),
    status: "inProgress",
  },

  // ── Done ──────────────────────────────────────────────────────────────────
  {
    title: "Set up Express server and project structure",
    priority: "high",
    due: daysFromToday(-7),
    status: "done",
  },
  {
    title: "Connect MongoDB with Mongoose",
    priority: "high",
    due: daysFromToday(-6),
    status: "done",
  },
  {
    title: "Create User and Task Mongoose models",
    priority: "medium",
    due: daysFromToday(-5),
    status: "done",
  },
  {
    title: "Build register and login API endpoints",
    priority: "high",
    due: daysFromToday(-4),
    status: "done",
  },
  {
    title: "Implement protected routes with JWT middleware",
    priority: "high",
    due: daysFromToday(-3),
    status: "done",
  },
  {
    title: "Set up React project with Vite and Tailwind",
    priority: "medium",
    due: daysFromToday(-5),
    status: "done",
  },
  {
    title: "Build login and register forms with validation",
    priority: "medium",
    due: daysFromToday(-3),
    status: "done",
  },
  {
    title: "Add CORS configuration to the backend",
    priority: "low",
    due: daysFromToday(-2),
    status: "done",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Find the first user in the database
    const user = await User.findOne().sort({ createdAt: 1 });
    if (!user) {
      console.error(
        "❌ No user found in the database. Register an account first, then run this script."
      );
      process.exit(1);
    }

    console.log(`👤 Seeding tasks for user: ${user.name} (${user.email})`);

    // Remove all existing tasks for this user first (clean slate)
    const deleted = await Task.deleteMany({ user: user._id });
    console.log(`🗑️  Removed ${deleted.deletedCount} existing task(s)`);

    // Insert all sample tasks
    const tasksToInsert = TASKS.map((t) => ({ ...t, user: user._id }));
    const inserted = await Task.insertMany(tasksToInsert);

    console.log(`\n🌱 Inserted ${inserted.length} tasks:\n`);

    const summary = { todo: 0, inProgress: 0, done: 0 };
    inserted.forEach((t) => summary[t.status]++);

    console.log(`   📋 To Do       : ${summary.todo}`);
    console.log(`   ⚡ In Progress  : ${summary.inProgress}`);
    console.log(`   ✅ Done         : ${summary.done}`);
    console.log(`\n✨ Seed complete!\n`);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
