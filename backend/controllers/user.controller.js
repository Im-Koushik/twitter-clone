import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong in user controller",
    });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot follow yourself",
      });
    }

    if (!currentUser || !targetUser)
      return res.status(404).json({
        message: "User not found",
      });

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      //Unfollow user
      await User.findByIdAndUpdate(id, {
        $pull: {
          followers: req.user._id,
        },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $pull: {
          following: id,
        },
      });
      return res.status(200).json({
        message: "User unfollowed successfully",
      });
    } else {
      //Follow user
      await User.findByIdAndUpdate(id, {
        $push: {
          followers: req.user._id,
        },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          following: id,
        },
      });

      //Notificaiton
      const newNotificaiton = new Notification({
        from: req.user._id,
        to: id,
        type: "follow",
      });
      await newNotificaiton.save();

      return res.status(200).json({
        message: "User followed successfully",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong in user controller",
    });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id.toString())
    );

    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));

    return res.status(200).json(suggestedUsers);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong in user controller",
    });
  }
};

export const updateUser = async (req, res) => {
  const { fullName, username, email, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res.status(404).json({
        error: "Please enter both current and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(404).json({
          error: "Current password is incorrect",
        });
      }

      if (newPassword.length < 6) {
        return res.status(404).json({
          error: "Password must be at least 6 characters long",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResposne = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResposne.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResposne = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResposne.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = null;

    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Something went wrong in user controller",
    });
  }
};
