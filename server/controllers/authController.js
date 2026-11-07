const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ===============================
// REGISTER USER
// ===============================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please enter name, email and password",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create normal user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
};


// ===============================
// NORMAL LOGIN
// ===============================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    // Find user in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};


// ===============================
// GOOGLE LOGIN
// ===============================

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is missing",
      });
    }

    // Verify Google account
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.sub) {
      return res.status(401).json({
        message: "Invalid Google credential",
      });
    }

    if (!payload.email_verified) {
      return res.status(401).json({
        message: "Google email is not verified",
      });
    }

    const googleEmail = payload.email.toLowerCase();
    const googleName = payload.name || "Google User";

    // Find existing account in MongoDB
    let user = await User.findOne({
      email: googleEmail,
    });

    if (!user) {
      // Create a new MongoDB account
      user = await User.create({
        name: googleName,
        email: googleEmail,
        googleId: payload.sub,
        password: await bcrypt.hash(
          require("crypto").randomBytes(32).toString("hex"),
          10
        ),
      });
    } else {
      // Link Google account to existing account
      if (user.googleId && user.googleId !== payload.sub) {
        return res.status(409).json({
          message: "This email is linked to another Google account",
        });
      }

      if (!user.googleId) {
        user.googleId = payload.sub;
        await user.save();
      }
    }

    // Generate JWT using MongoDB user ID
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Google login error:", error);

    return res.status(500).json({
      message: "Google login failed",
      error: error.message,
    });
  }
};


// ===============================
// EXPORT
// ===============================
module.exports = {
  registerUser,
  loginUser,
  googleLogin,
};