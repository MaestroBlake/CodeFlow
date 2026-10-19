const express = require("express");
const router = express.Router();

const {
    submitProcess,
    fetchProcess
} = require("../controllers/processController");

router.post("/", submitProcess);
router.get("/:id", fetchProcess);

module.exports = router;  