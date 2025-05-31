import jwt from "jsonwebtoken";

export const generateToken = (user, res, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    })
    .json({ message, user });
};
