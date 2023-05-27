const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
mongoose.connect("mongodb://127.0.0.1:27017/vinted");

const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);
const test = "marwa";
app.get("/", (req, res) => {
  try {
    return res.status(200).json({ message: "Welcome" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  try {
    res.status(404).json("Not found");
  } catch (error) {
    res.status(400).json(error.message);
  }
});

app.listen(3000, () => {
  console.log("Server on fire 🔥");
});
