import jwt from "jsonwebtoken";

const resolveTokenCookieOptions = () => {
  const secure =
    process.env.COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production";

  const crossSiteCookies = process.env.COOKIE_CROSS_SITE !== "false";

  return {
    httpOnly: true,
    secure,
    sameSite: crossSiteCookies ? "none" : "lax",
    // Helps modern browsers accept third-party cookies in partitioned storage.
    partitioned: crossSiteCookies,
  };
};

export const generateToken = (userId, res) => {
  const payload = { id: userId };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
  res.cookie("token", token, {
    ...resolveTokenCookieOptions(),
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
};

export { resolveTokenCookieOptions };
