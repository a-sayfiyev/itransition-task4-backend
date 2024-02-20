const jwt = require("jsonwebtoken");

function authorization(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access denied!");

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(400).send("Invalid token!");
  }
}

module.exports = { authorization };
