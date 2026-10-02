import express from "express";

const app = express();

app.get("/api/v1/signup", (req, res) => {
  res.send("Signup endpoint");
});

app.get("/api/v1/signin", (req, res) => {
  res.send("Signin endpoint");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});   