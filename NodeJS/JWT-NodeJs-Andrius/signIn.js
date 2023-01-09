import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const jwtSecret = process.env.jwtSecret;

export const signIn = (req, res) => {
  console.log(req.headers)
  const { userName, password } = req.body;

  const expiresIn = 60;
  const issuedAt = new Date().getTime();

  const users = {
    Jonas: "kaledos",
    Andrius: "velykos",
  };

  if (typeof userName !== "string" || typeof password !== "string") {
    return res.status(400).send({ error: "Data is incorrect" });
  }

  if (!userName || !password) {
    return res
      .status(400)
      .send({ error: "Please provide userName and password" });
  }

  if (password !== users[userName]) {
    return res.status(400).send({ error: "Incorrect login data" });
  }

  const token = jwt.sign({ userName, issuedAt }, jwtSecret, {
    algorithm: "HS256",
    expiresIn,
  }); // kartais vadinama access token. ExpiresIn turetu buti .env faile

  res.cookie("token", token, { maxAge: expiresIn * 1_000 });
  
  res.send({accessToken: token}).end();
};
