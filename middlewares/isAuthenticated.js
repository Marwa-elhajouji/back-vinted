const User = require("../models/User");
const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization.replace("Bearer ", "");
  const user = await User.findOne({ token: token });
  if (user) {
    req.user = user;
    return next();
  } else {
    return res.status(401).json("Unauthorized");
  }
};
module.exports = isAuthenticated;
