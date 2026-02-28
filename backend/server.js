const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let ads = [];

app.get("/ads", (req, res) => {
  res.json(ads);
});

app.post("/ads", (req, res) => {
  const ad = req.body;
  ads.push(ad);
  res.json(ad);
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});