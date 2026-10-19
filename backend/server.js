const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
    ]
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "CodeFlow Process Manager is running" });
});

const PORT = process.env.PORT || 5000;

app.use("/api/processes", require("./routes/processRoutes"));

app.listen(PORT, () => {
    console.log(`Process Manager running on port ${PORT}`);
});