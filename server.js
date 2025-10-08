import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("./"));

// 🧠 Render chỉ cho ghi tạm trong /tmp
const DATA_FILE = "/tmp/data.json";

// 🧩 Nếu file chưa có, tạo mới
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ status: "ONLINE", items: {}, texts: {} }, null, 2)
  );
  console.log("🆕 Đã tạo file data.json mặc định tại /tmp");
}

// 📥 API: Lấy dữ liệu hiện tại
app.get("/api/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("❌ Lỗi đọc data.json:", err);
      return res.status(500).json({ error: "Không thể đọc dữ liệu" });
    }
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      console.error("⚠️ Lỗi parse JSON:", e);
      res.json({ status: "ONLINE", items: {}, texts: {} });
    }
  });
});

// 💾 API: Ghi dữ liệu (giá + chữ + trạng thái)
app.post("/api/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, oldData) => {
    let current = { status: "ONLINE", items: {}, texts: {} };

    if (!err && oldData) {
      try {
        current = JSON.parse(oldData);
      } catch (e) {
        console.warn("⚠️ Lỗi đọc data cũ, tạo mới.");
      }
    }

    // 🔁 Gộp dữ liệu cũ và mới (không mất phần chưa sửa)
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
      console.error("❌ Không thể ghi file:", err2);
      res.status(500).json({ error: "Không thể ghi dữ liệu" });
    }
  });
});

// 🧾 Route kiểm tra file thật (debug)
app.get("/api/debug", (req, res) => {
  res.sendFile(path.resolve(DATA_FILE));
});

// 🚀 Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server chạy tại: http://localhost:${PORT}`));
