import jwt from "jsonwebtoken";

const TOKEN_DURATION_SECONDS = 20 * 60;
const TOKEN_DURATION_MS = TOKEN_DURATION_SECONDS * 1000;

export const generateToken = (userId, res) => {
  const payload = { id: userId };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: TOKEN_DURATION_SECONDS,
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: TOKEN_DURATION_MS,
  });
  return token;
};
