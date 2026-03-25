require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const TARGET_EMAIL = "test@example.com";
const NEW_PASSWORD = "password123";

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const user = await User.findOne({ email: TARGET_EMAIL });
    if (!user) {
      console.error(`❌ No user found with email: ${TARGET_EMAIL}`);
      process.exit(1);
    }

    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);
    user.password = hashed;
    await user.save();

    console.log(`\n🔐 Password reset successful!\n`);
    console.log(`   📧 Email    : ${TARGET_EMAIL}`);
    console.log(`   🔑 Password : ${NEW_PASSWORD}`);
    console.log(`\n✨ You can now log in with these credentials.\n`);
  } catch (err) {
    console.error("❌ Reset failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();
