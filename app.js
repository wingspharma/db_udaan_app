require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");


const connectDb = require("./config/db");
const routes = require("./routes/v1/index");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

connectDb();

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "DB Udaan API Running"
    });
});




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});