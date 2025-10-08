import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("./"));

// 📁 Render chỉ cho ghi trong thư mục /tmp
const DATA_FILE = "/tmp/data.json";

// 🧩 Tạo file mặc định nếu chưa có
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ status: "ONLINE", items: {}, texts: {} }, null, 2)
  );
  console.log("🆕 Đã tạo file data.json mặc định tại /tmp");
}

// 🔒 Hàm kiểm tra object an toàn
const safeObj = obj =>
  obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {};

// 📥 API: Lấy dữ liệu
app.get("/api/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("❌ Lỗi đọc file:", err);
      return res.status(500).json({ error: "Không thể đọc dữ liệu" });
    }
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      console.warn("⚠️ Lỗi parse JSON, trả về mặc định");
      res.json({ status: "ONLINE", items: {}, texts: {} });
    }
  });
});

// 💾 API: Ghi dữ liệu (giá + chữ)
app.post("/api/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, oldData) => {
    let current = { status: "ONLINE", items: {}, texts: {} };

    if (!err && oldData) {
      try {
        current = JSON.parse(oldData);
      } catch (e) {
        console.warn("⚠️ File data.json lỗi JSON, khởi tạo lại.");
      }
    }

    console.log("📦 Dữ liệu nhận được:", req.body);

    // 🔁 Gộp dữ liệu cũ và mới an toàn
    const merged = {
      status: req.body.status || current.status,
      items: { ...safeObj(current.items), ...safeObj(req.body.items) },
      texts: { ...safeObj(current.texts), ...safeObj(req.body.texts) }
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

// 🧾 API kiểm tra trực tiếp file đang lưu
app.get("/api/debug", (req, res) => {
  res.sendFile(path.resolve(DATA_FILE));
});

// 🚀 Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`)
);
