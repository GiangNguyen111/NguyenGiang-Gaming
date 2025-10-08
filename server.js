import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("./"));

const DATA_FILE = "./data.json";

// 🧩 Tạo file mặc định nếu chưa có
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ status: "ONLINE", items: {}, texts: {} }, null, 2));
  console.log("🆕 Đã tạo file data.json mặc định");
}

// 📥 Lấy dữ liệu
app.get("/api/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Không thể đọc dữ liệu" });
    try {
      res.json(JSON.parse(data));
    } catch {
      res.json({ status: "ONLINE", items: {}, texts: {} });
    }
  });
});

// 💾 Ghi dữ liệu (hợp nhất chữ + giá)
app.post("/api/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, oldData) => {
    let current = { status: "ONLINE", items: {}, texts: {} };
    if (!err && oldData) {
      try {
        current = JSON.parse(oldData);
      } catch {
        current = { status: "ONLINE", items: {}, texts: {} };
      }
    }

    // Gộp dữ liệu cũ và mới (để không mất phần nào)
    const merged = {
      status: req.body.status || current.status,
      items: req.body.items || current.items,
      texts: req.body.texts || current.texts
    };

    fs.writeFile(DATA_FILE, JSON.stringify(merged, null, 2), err2 => {
      if (err2) return res.status(500).json({ error: "Không thể ghi dữ liệu" });
      res.json({ success: true });
    });
  });
});

// 🚀 Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server chạy tại: http://localhost:${PORT}`));
