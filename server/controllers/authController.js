const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const { v4: uuidv4 } = require('uuid'); 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const displayName = payload['name'];

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: email, 
        email,
        password: '', 
        displayName,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(uuidv4(), salt); 

      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Google login successful', token });

  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: 'Google login failed' });
  }
};