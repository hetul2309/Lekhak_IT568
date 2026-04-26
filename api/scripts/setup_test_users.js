import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.model.js";

const setup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONN, { dbName: 'Lekhak' });
    console.log("Connected to DB");

    const adminEmail = "bloglekhak2629@gmail.com";
    const normalEmail = "testuser@example.com";
    const password = "Password123!";
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Upsert Admin
    await User.findOneAndUpdate(
      { email: adminEmail },
      {
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        name: "Admin User",
        username: "adminuser",
      },
      { upsert: true, new: true }
    );
    console.log("Admin user upserted");

    // Upsert Normal User
    await User.findOneAndUpdate(
      { email: normalEmail },
      {
        email: normalEmail,
        password: hashedPassword,
        role: "user",
        name: "Test User",
        username: "testuser",
      },
      { upsert: true, new: true }
    );
    console.log("Normal user upserted");

    process.exit(0);
  } catch (error) {
    console.error("Error setting up users:", error);
    process.exit(1);
  }
};

setup();
