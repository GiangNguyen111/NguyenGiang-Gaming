import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("./"));

// ⚙️ Khởi tạo database SQLite (tự tạo nếu chưa có)
const db = new Database("data.db");

// 🧩 Tạo bảng lưu trữ nếu chưa tồn tại
db.prepare("CREATE TABLE IF NOT EXISTS store (id TEXT PRIMARY KEY, json TEXT)").run();

// 📥 API lấy dữ liệu
app.get("/api/data", (req, res) => {
  try {
    const row = db.prepare("SELECT json FROM store WHERE id = 'main'").get();
    if (row) {
      res.json(JSON.parse(row.json));
    } else {
      const defaultData = { status: "ONLINE", items: {}, texts: {} };
      res.json(defaultData);
    }
  } catch (err) {
    console.error("❌ Lỗi đọc DB:", err);
    res.status(500).json({ error: "Không thể đọc dữ liệu" });
  }
});

// 💾 API ghi dữ liệu (có chống lỗi mất chữ/giá)
app.post("/api/data", (req, res) => {
  try {
    // Lấy dữ liệu cũ trong DB (nếu có)
    const row = db.prepare("SELECT json FROM store WHERE id = 'main'").get();
    let current = { status: "ONLINE", items: {}, texts: {} };

    if (row) {
      try {
        current = JSON.parse(row.json);
      } catch {
        console.warn("⚠️ Lỗi parse JSON cũ, tạo mới");
      }
    }

    // Hàm kiểm tra object hợp lệ
    const safeObj = (obj) =>
      obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {};

    // ✅ Gộp cẩn thận, tránh mất dữ liệu khi req.body rỗng hoặc undefined
    const merged = {
      status: req.body.status || current.status,
      items: Object.keys(safeObj(req.body.items)).length
        ? { ...current.items, ...safeObj(req.body.items) }
        : current.items,
      texts: Object.keys(safeObj(req.body.texts)).length
        ? { ...current.texts, ...safeObj(req.body.texts) }
        : current.texts,
    };

    // Ghi lại vào database
    db.prepare(
      "INSERT OR REPLACE INTO store (id, json) VALUES ('main', ?)"
    ).run(JSON.stringify(merged, null, 2));

    console.log("✅ Đã lưu vào database:", merged);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Không thể ghi dữ liệu:", err);
    res.status(500).json({ error: "Không thể ghi dữ liệu" });
  }
});

// 🧾 API debug để xem dữ liệu thực tế trong DB
app.get("/api/debug", (req, res) => {
  try {
    const row = db.prepare("SELECT json FROM store WHERE id = 'main'").get();
    res.type("application/json").send(row ? row.json : "{}");
  } catch (err) {
    res.status(500).send("{}");
  }
});

// 🚀 Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server chạy tại: http://localhost:${PORT}`)
);
