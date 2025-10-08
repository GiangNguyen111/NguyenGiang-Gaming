import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("./"));

const DATA_FILE = "./data.json";

// Lấy dữ liệu
app.get("/api/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Không thể đọc dữ liệu" });
    res.json(JSON.parse(data));
  });
});

// Ghi dữ liệu
app.post("/api/data", (req, res) => {
  fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).json({ error: "Không thể ghi dữ liệu" });
    res.json({ success: true });
  });
});

// Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server chạy tại: http://localhost:${PORT}`));

