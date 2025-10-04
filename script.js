let isAdmin = false;
const statusBox = document.getElementById("statusBox");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const submitLogin = document.getElementById("submitLogin");
const loginMsg = document.getElementById("loginMsg");
const togglePass = document.getElementById("togglePass");
const passwordInput = document.getElementById("password");

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
  document.getElementById("datetime").textContent = date + " - " + time;
}
updateDateTime();
setInterval(updateDateTime, 1000);

statusBox.addEventListener("click", () => {
  if (!isAdmin) {
    loginModal.style.display = "flex";
  } else {
    if (statusBox.textContent.includes("ONLINE")) {
      statusBox.textContent = "🔴 OFFLINE";
      statusBox.style.color = "red";
    } else {
      statusBox.textContent = "🟢 ONLINE";
      statusBox.style.color = "#0f0";
    }
  }
});

closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
  loginMsg.textContent = "";
});

submitLogin.addEventListener("click", () => {
  const user = document.getElementById("username").value;
  const pass = passwordInput.value;

  if (user === "nguyengiang200722" && pass === "Zxc1230@@") {
    isAdmin = true;
    loginModal.style.display = "none";
    loginMsg.textContent = "";
    alert("Đăng nhập thành công! Bạn có thể chỉnh trạng thái.");
  } else {
    loginMsg.textContent = "Sai tài khoản hoặc mật khẩu!";
  }
});

togglePass.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePass.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
  } else {
    passwordInput.type = "password";
    togglePass.innerHTML = '<i class="fa-solid fa-eye"></i>';
  }
});
const data = [
  {
    section: "Rise of the Abyssal",
    items: [
      { game: "Path Of Exile 2", item: "Chao Orb", price: "ib" },
      { game: "Path Of Exile 2", item: "Exalted Orb", price: "ib" },
      { game: "Path Of Exile 2", item: "Divine Orb", price: "2.200đ" }
    ]
  },
  {
    section: "Rise of the Abyssal",
    items: [
      { game: "Path Of Exile 2", item: "Regal Orb", price: "0đ" },
      { game: "Path Of Exile 2", item: "Alchemy Orb", price: "0đ" }
    ]
  },
  {
    section: "Rise of the Abyssal",
    items: [
      { game: "Path Of Exile 1", item: "Chao Orb", price: "inbox" },
      { game: "Path Of Exile 1", item: "Chaos Orb", price: "inbox" },
      { game: "Path Of Exile 1", item: "Mirror of Kalandra", price: "inbox" }
    ]
  },
  {
    section: "Rise of the Abyssal",
    items: [
      { game: "Path Of Exile 1", item: "Divine Orb", price: "0đ" },
      { game: "Path Of Exile 1", item: "Mirror of Kalandra", price: "inbox" }
    ]
  }
];
const container = document.getElementById("content");

data.forEach(group => {
  const section = document.createElement("section");
  section.className = "section";
  section.innerHTML = `<h2>${group.section}</h2>`;

  const itemsDiv = document.createElement("div");
  itemsDiv.className = "items";

  group.items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.game}</h3>
      <p class="item">${item.item}</p>
      <p class="price" data-price="${item.price}">${item.price}</p>
    `;
    itemsDiv.appendChild(card);
  });

  section.appendChild(itemsDiv);
  container.appendChild(section);
});
document.querySelectorAll(".price").forEach(el => {
  const text = el.textContent.toLowerCase();

  if (text.includes("0đ")) {
    el.style.color = "red";
    el.style.fontWeight = "bold";
    el.dataset.type = "zero";
  } else if (text.includes("inbox")) {
    el.style.color = "orange";
    el.style.fontWeight = "bold";
    el.dataset.type = "inbox";
  } else {
    el.dataset.type = "normal";
  }

  el.addEventListener("click", () => {
    let newPrice = prompt("Nhập giá mới:", el.dataset.price);
    if (newPrice) {
      el.dataset.price = newPrice;
      el.textContent = newPrice;
    }
  });
});
