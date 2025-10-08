let adminLevel = 0;
let hasChanges = false; // 🆕 Theo dõi có thay đổi chữ hoặc giá

const statusBox = document.getElementById("statusBox");
const saveAllBtn = document.getElementById("saveAllBtn");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const submitLogin = document.getElementById("submitLogin");
const loginMsg = document.getElementById("loginMsg");
const togglePass = document.getElementById("togglePass");
const passwordInput = document.getElementById("password");

// 🕒 Cập nhật ngày giờ
function updateDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const time = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  document.getElementById("datetime").textContent = `${date} – ${time}`;
}
updateDateTime();
setInterval(updateDateTime, 1000);

// ⚙️ Đặt trạng thái ONLINE / OFFLINE
function setStatus(state) {
  if (state === "ONLINE") {
    statusBox.textContent = "🟢 ONLINE";
    statusBox.style.color = "#0f0";
    localStorage.setItem("status", "ONLINE");
  } else {
    statusBox.textContent = "🔴 OFFLINE";
    statusBox.style.color = "red";
    localStorage.setItem("status", "OFFLINE");
  }
}

// 🟩 Khi tải trang, lấy dữ liệu từ server
window.addEventListener("load", async () => {
  const data = await getDataFromServer();

  if (data && data.status) {
    setStatus(data.status);
  } else {
    const savedStatus = localStorage.getItem("status");
    setStatus(savedStatus || "ONLINE");
  }

  // 💰 Cập nhật giá từ server
  if (data && data.items) {
    for (const [key, price] of Object.entries(data.items)) {
      document.querySelectorAll(".price").forEach(el => {
        const itemKey =
          el.previousElementSibling?.textContent.trim() || el.dataset.editId;
        if (itemKey === key) el.textContent = price;
      });
    }
  }

  // 📝 Cập nhật chữ từ server
  if (data && data.texts) {
    for (const [key, value] of Object.entries(data.texts)) {
      const el = document.querySelector(`[data-edit-id='${key}']`);
      if (el) el.textContent = value;
    }
  }
});

// 🟢 Click đổi trạng thái
statusBox.addEventListener("click", async () => {
  if (adminLevel === 0) {
    loginModal.style.display = "flex";
  } else {
    if (statusBox.textContent.includes("ONLINE")) {
      setStatus("OFFLINE");
      await saveDataToServer({ status: "OFFLINE" });
    } else {
      setStatus("ONLINE");
      await saveDataToServer({ status: "ONLINE" });
    }
  }
});

// 🔻 Đóng form login
closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
  loginMsg.textContent = "";
});

// 🟡 Xử lý login
function handleLogin() {
  const user = document.getElementById("username").value.trim();
  const pass = passwordInput.value.trim();

  if (user === "nguyengiang200722" && pass === "Zxc1230@@") {
    adminLevel = 1;
    showCustomAlert("✅ Đăng nhập thành công!");
    afterLogin();
  } else {
    loginMsg.textContent = "❌ Sai tài khoản hoặc mật khẩu!";
  }
}

document.getElementById("loginModal").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleLogin();
  }
});
submitLogin.addEventListener("click", handleLogin);

// 🧩 Sau khi login
function afterLogin() {
  loginModal.style.display = "none";
  loginMsg.textContent = "";
  enableTextEditing();
  enablePriceEditing();
}

// 👁 Toggle mật khẩu
togglePass.addEventListener("click", () => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  togglePass.innerHTML =
    passwordInput.type === "text"
      ? '<i class="fa-solid fa-eye-slash"></i>'
      : '<i class="fa-solid fa-eye"></i>';
});

// 💰 Chỉnh giá vật phẩm (lưu server)
function enablePriceEditing() {
  const priceModal = document.getElementById("priceModal");
  const priceItemName = document.getElementById("priceItemName");
  const newPriceInput = document.getElementById("newPriceInput");
  const savePrice = document.getElementById("savePrice");
  const cancelPrice = document.getElementById("cancelPrice");
  let currentPriceEl = null;

  document.querySelectorAll(".price").forEach(el => {
    el.addEventListener("click", () => {
      if (adminLevel < 1) {
        alert("❌ Bạn cần đăng nhập Admin để chỉnh giá!");
        return;
      }
      currentPriceEl = el;
      priceItemName.textContent =
        el.previousElementSibling?.textContent || "Sản phẩm";
      newPriceInput.value = el.textContent;
      priceModal.style.display = "flex";
      document.body.style.overflow = "hidden";
      setTimeout(() => newPriceInput.focus(), 100);
    });
  });

  newPriceInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      savePrice.click();
    }
  });

  savePrice.addEventListener("click", async () => {
    const newPrice = newPriceInput.value.trim();
    if (newPrice && currentPriceEl) {
      const itemKey =
        currentPriceEl.previousElementSibling?.textContent.trim() ||
        currentPriceEl.dataset.editId;
      currentPriceEl.textContent = newPrice;
      hasChanges = true; // 🆕 đánh dấu có thay đổi
      showSaveButton();
    }
    closeModal();
  });

  cancelPrice.addEventListener("click", closeModal);
  priceModal.addEventListener("click", e => {
    if (e.target === priceModal) closeModal();
  });

  function closeModal() {
    priceModal.style.display = "none";
    document.body.style.overflow = "";
    newPriceInput.value = "";
  }
}

// 🧠 Tải lại giá từ localStorage (dự phòng)
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".price").forEach(el => {
    const itemKey =
      el.previousElementSibling?.textContent.trim() || el.dataset.editId;
    const savedPrice = localStorage.getItem("price_" + itemKey);
    if (savedPrice) el.textContent = savedPrice;
  });
});

// 🖊️ Chỉnh văn bản
function enableTextEditing() {
  const selector =
    "h1, h2, h3, p.subtitle, .item, .price-title, .section-title, .trade-box p, .trade-box li, .trade-box h2, .trade-box h3";
  document.querySelectorAll(selector).forEach((el, index) => {
    if (!el.dataset.editId)
      el.dataset.editId = `${el.tagName.toLowerCase()}_${index}`;
    el.setAttribute("data-original", el.textContent);
  });

  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener("click", () => {
      if (adminLevel === 0) return;
      if (el.isContentEditable) return;
      el.contentEditable = "true";
      el.style.outline = "2px dashed #00eaff";
      el.focus();
      el.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          el.blur();
        }
      });
      el.addEventListener(
        "blur",
        () => {
          el.contentEditable = "false";
          el.style.outline = "none";
          hasChanges = true; // 🆕 Có thay đổi
          showSaveButton();
        },
        { once: true }
      );
    });
  });
}

// 💾 Hiển thị nút Lưu khi có thay đổi
function showSaveButton() {
  if (adminLevel > 0 && hasChanges) {
    saveAllBtn.style.display = "block";
  }
}

// 🔘 Khi nhấn nút Lưu thay đổi
saveAllBtn.addEventListener("click", async () => {
  const prices = {};
  document.querySelectorAll(".price").forEach(el => {
    const key = el.previousElementSibling?.textContent.trim() || el.dataset.editId;
    prices[key] = el.textContent.trim();
  });

  const texts = {};
  document.querySelectorAll("[data-edit-id]").forEach(el => {
    texts[el.dataset.editId] = el.textContent.trim();
  });

  await saveDataToServer({
    status: statusBox.textContent.includes("ONLINE") ? "ONLINE" : "OFFLINE",
    items: prices,
    texts: texts
  });

  hasChanges = false;
  saveAllBtn.style.display = "none";
  showCustomAlert("✅ Đã lưu thay đổi lên server!");
});

// 🔔 Thông báo tùy chỉnh
function showCustomAlert(message) {
  const alertBox = document.getElementById("customAlert");
  if (alertBox) {
    const msg = document.getElementById("alertMessage");
    msg.textContent = message;
    alertBox.classList.remove("hidden");
    setTimeout(() => {
      alertBox.classList.add("hidden");
    }, 3000);
  } else {
    alert(message);
  }
}

// 🧠 Kết nối server — đọc / ghi dữ liệu
async function getDataFromServer() {
  try {
    const res = await fetch("https://nguyengiang-gaming.onrender.com/api/data");
    return res.json();
  } catch (err) {
    console.error("Lỗi lấy dữ liệu từ server:", err);
    return null;
  }
}

async function saveDataToServer(data) {
  try {
    await fetch("https://nguyengiang-gaming.onrender.com/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    console.log("✅ Dữ liệu đã lưu lên server thành công!");
  } catch (err) {
    console.error("Lỗi lưu dữ liệu lên server:", err);
  }
}
fetch("/api/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    items: itemsData,
    texts: textsData
  }),
})
  .then((res) => res.json())
  .then((data) => {
    console.log("Server phản hồi:", data);
    alert("✅ Dữ liệu đã lưu lên server thành công!");
    // 👉 Gọi lại loadData() để tải dữ liệu mới từ server
    if (typeof loadData === "function") {
      loadData();
    }
  })
  .catch((err) => {
    console.error("❌ Lỗi khi gửi dữ liệu:", err);
    alert("Lưu thất bại!");
  });
