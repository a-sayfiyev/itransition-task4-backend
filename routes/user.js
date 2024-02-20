const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authorization: verify } = require("./verification");

router.get("/", verify, async (req, res) => {
  console.log("Reached /api/user endpoint");
  try {
    const users = await User.find(
      {},
      {
        _id: 1,
        name: 1,
        email: 1,
        loginTime: 1,
        registrationTime: 1,
        isActive: 1,
      }
    );

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/", verify, async (req, res) => {
  const userIds = req.body.userIds;

  try {
    const deletedUsers = await User.deleteMany({ _id: { $in: userIds } });

    if (deletedUsers.deletedCount > 0) {
      res.json({
        message: "Users deleted successfully",
        users: deletedUsers,
      });
    } else {
      res.status(404).json({ message: "Users not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/", verify, async (req, res) => {
  const { userIds, action } = req.body;

  try {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    const updatePromises = userIds.map(async (userId) => {
      const user = await User.findById(userId);

      if (user) {
        if (action === "block") {
          user.isActive = false;
        } else if (action === "unblock") {
          user.isActive = true;
        }

        user.loginTime = new Date();

        const updatedUser = await user.save();
        return updatedUser;
      } else {
        return null; // User not found
      }
    });

    const updatedUsers = await Promise.all(updatePromises);
    const validUpdates = updatedUsers.filter((user) => user !== null);

    res.json({
      message: "User status updated successfully",
      updatedUsers: validUpdates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
