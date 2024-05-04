import { generateWebTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email is not valid",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        message: "Username is already taken",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email is already taken",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateWebTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        message: "User created successfully",
        user: newUser,
      });
    } else {
      return res.status(400).json({
        message: "Invalid user data",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong in auth controller",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    generateWebTokenAndSetCookie(user._id, res);
    return res.status(200).json({
      message: "Logged in successfully",
      user: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong in auth controller",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong in auth controller",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong in auth controller",
    });
  }
};
