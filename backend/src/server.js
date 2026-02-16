const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/scan", require("./routes/scanRoutes"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
