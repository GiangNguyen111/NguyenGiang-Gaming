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
      } catch {}
    }

    const merged = {
      status: req.body.status || current.status,
      items: { ...current.items, ...req.body.items },
      texts: { ...current.texts, ...req.body.texts }
    };

    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2));
      console.log("✅ Đã lưu thay đổi:", merged);
      res.json({ success: true });
    } catch (err2) {
      res.status(500).json({ error: "Không thể ghi dữ liệu" });
    }
  });
});

// 🚀 Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server chạy tại: http://localhost:${PORT}`));
