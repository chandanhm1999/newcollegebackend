import jwt from "jsonwebtoken";

export const generateToken = (user, res, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      sameSite: isProduction ? "None" : "Lax",
      secure: isProduction, // true only in production
    })
    .json({ message, user });
};
