let userData = { date: '', list: [], original: '', nextIndex: 0 };

function hideUserListPopup(e) {
  if (!e || e.target.id === "userListPopup") {
    document.getElementById("userListPopup").style.display = "none";
  }
}

function showToast(msg, color = "#00c853", reload = false, withLoader = false) {
  const toast = document.getElementById("toast");
  toast.innerHTML = withLoader ? `<div>${msg}</div><div class="loader"></div>` : msg;
  toast.style.background = color;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
    if (reload) location.reload();
  }, withLoader ? 2000 : 1500);
}

function toggleSection(mode) {
  document.getElementById("codeSection").style.display = "none";
  document.getElementById("outputSection").style.display = "none";
  document.getElementById("monoInput").style.display = "none";
  document.getElementById("monoRunBtn").style.display = "none";
  document.getElementById("monoResult").style.display = "none";
  document.getElementById("copyMono").style.display = "none";
  document.getElementById("historyOutput").style.display = "none";
  document.getElementById("listPopup").style.display = "none";
  document.getElementById("userListPopup").style.display = "none";

  if (mode === "home") {
    document.getElementById("codeSection").style.display = "flex";
    document.getElementById("outputSection").style.display = "block";
  } else if (mode === "mono") {
    document.getElementById("monoInput").style.display = "block";
    document.getElementById("monoRunBtn").style.display = "inline-block";
  } else if (mode === "history") {
    showHistory();
    document.getElementById("historyOutput").style.display = "block";
  } else if (mode === "list") {
    document.getElementById("listPopup").style.display = "flex";
  }
}

function submitListPopup() {
  const date = document.getElementById("popupDateInput").value.trim();
  const listText = document.getElementById("popupListInput").value.trim();
  const lines = listText.split("\n");
  if (!date || lines.length === 0) return showToast("❌ Date ya List missing!", "#ff1744");

  let cleaned = [];
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    let parts = line.split(/\s+/);
    let serial = parseInt(parts[0]);
    if (!isNaN(serial)) {
      if (line.toLowerCase().includes("del")) {
        cleaned.push({ serial, value: "deleted" });
      } else {
        cleaned.push({ serial, value: parts[parts.length - 1] });
      }
    }
  }

  userData = {
    date,
    list: cleaned,
    original: listText,
    nextIndex: 0
  };
  localStorage.setItem("amit_user_data", JSON.stringify(userData));
  showToast("✅ List saved!", "#00c853", true, true);
  document.getElementById("listPopup").style.display = "none";
}

function insertCode() {
  const code = document.getElementById("codeInput").value.trim();
  const number = document.getElementById("numberInput").value.trim();
  if (!code || !number || (code.length !== 8 && code.length !== 9) || isNaN(number)) {
    showToast("❌ Format: ABC123456 + 2300", "#ff1744");
    return;
  }

  for (let i = userData.nextIndex; i < userData.list.length; i++) {
    let item = userData.list[i];
    if (item.value !== "deleted" && !item.value.includes(" ")) {
      item.value = `${code}   ${number}   ${item.value}`;
      userData.nextIndex = i + 1;
      localStorage.setItem("amit_user_data", JSON.stringify(userData));
      showToast(`✅ Code saved!`, "#00c853", true, true);
      showList();
      return;
    }
  }
  showToast("⚠️ No space left to insert.", "#ff9100");
}

function showList() {
  const saved = localStorage.getItem("amit_user_data");
  const resultEl = document.getElementById("result");
  if (!saved) {
    resultEl.innerText = "No data.";
    return;
  }
  const data = JSON.parse(saved);
  let output = `**${data.date}**\n\n****\n\n`;
  for (let item of data.list) {
    let val = item.value.replace(/\b([A-Za-z0-9]{8,9})\b/g, "`$1`");
    output += `${item.serial}.   ${val}\n\n`;
  }
  resultEl.innerText = output;
  document.getElementById("copyBtn").style.display = "inline-block";
}

function copyResult() {
  const text = document.getElementById("result").innerText;
  navigator.clipboard.writeText(text).then(() => showToast("📋 Copied!", "#00c853"));
}

function showEditPopup() {
  document.getElementById("editPopup").style.display = "flex";
  document.getElementById("botInput").focus();
}

function hideEditPopup(e) {
  if (!e || e.target.id === "editPopup") {
    document.getElementById("editPopup").style.display = "none";
  }
}

document.getElementById("codeEditInput").addEventListener("input", () => {
  const val = document.getElementById("codeEditInput").value.trim();
  if (val.length >= 8) {
    document.getElementById("userInput").focus();
  }
});

function submitEdit() {
  const serial = parseInt(document.getElementById("botInput").value.trim());
  const code = document.getElementById("codeEditInput").value.trim();
  const user = document.getElementById("userInput").value.trim();

  if (isNaN(serial) || !code || !user || (code.length !== 8 && code.length !== 9)) {
    showToast("❌ Fill all fields correctly!", "#ff1744");
    return;
  }

  const item = userData.list.find(x => x.serial === serial);
  if (!item) {
    showToast("❌ Serial not found!", "#ff1744");
    return;
  }

  if (item.value === "deleted") {
    showToast("⚠️ Cannot update deleted line!", "#ff9100");
    return;
  }

  item.value = `${code}   ${user}`;
  localStorage.setItem("amit_user_data", JSON.stringify(userData));
  showToast("✅ Entry updated!", "#00c853", true, true);
  showList();
  document.getElementById("editPopup").style.display = "none";
}

function runMono() {
  const lines = document.getElementById("monoInput").value.trim().split("\n");
  let output = lines.map(line => line.trim()).filter(line => line).map(line => line.replace(/\b([A-Za-z0-9]{8,9})\b/, "`$1`")).join("\n\n");
  document.getElementById("monoResult").innerText = output;
  document.getElementById("monoResult").style.display = "block";
  document.getElementById("copyMono").style.display = "inline-block";
  showToast("✅ Converted to mono");
}

function copyMonoResult() {
  const text = document.getElementById("monoResult").innerText;
  navigator.clipboard.writeText(text).then(() => showToast("📋 Mono Copied!", "#00c853"));
}

function autoFocusNumber() {
  const codeField = document.getElementById("codeInput");
  const numberField = document.getElementById("numberInput");
  if (codeField.value.trim().length >= 8) numberField.focus();
}

function saveUpdatedListToHistory() {
  const saved = localStorage.getItem("amit_user_data");
  if (!saved) return showToast("❌ No list to save!");
  const data = JSON.parse(saved);
  const output = document.getElementById("result").innerText.trim();
  if (!output) return showToast("⚠️ Nothing to save.");
  let history = JSON.parse(localStorage.getItem("amit_final_history") || "[]");
  history.unshift({ date: data.date, output });
  localStorage.setItem("amit_final_history", JSON.stringify(history));
  showToast("✅ Saved to history!");
}

function showHistory() {
  const container = document.getElementById("historyOutput");
  let history = JSON.parse(localStorage.getItem("amit_final_history") || "[]");

  if (!history.length) {
    container.innerHTML = "📭 No saved history.";
  } else {
    container.innerHTML = `<h3 style="margin-bottom:15px;">📜 Saved Lists:</h3>` +
      history.map((h, i) =>
        `<div style="display: flex; align-items: center; gap: 15px; background: #000; padding: 10px 15px; border-radius: 8px; margin-bottom: 8px; justify-content: space-between; flex-wrap: wrap;">
          <span style="font-weight: bold;">📅 ${h.date}</span>
          <span style="display: flex; gap: 10px;">
            <button class="btn-copy copy-history" data-text="${encodeURIComponent(h.output)}">📋</button>
            <button onclick="deleteHistory(${i})" style="background:#d32f2f; color:#fff; border:none; padding:10px 15px; border-radius:8px;">❌</button>
          </span>
        </div>`
      ).join("");
  }

  // Fix multiple copy buttons using data-text
  document.querySelectorAll(".copy-history").forEach(btn => {
    btn.addEventListener("click", () => {
      const text = decodeURIComponent(btn.getAttribute("data-text"));
      navigator.clipboard.writeText(text)
        .then(() => showToast("📋 Copied!", "#00c853"))
        .catch(() => showToast("❌ Copy failed!", "#ff1744"));
    });
  });

  container.style.display = "block";
}

function deleteHistory(i) {
  let history = JSON.parse(localStorage.getItem("amit_final_history") || "[]");
  history.splice(i, 1);
  localStorage.setItem("amit_final_history", JSON.stringify(history));
  showToast("❌ Deleted!", "#d32f2f");
  showHistory();
}

function showUserListPopup() {
  const saved = localStorage.getItem("amit_user_data");
  const box = document.getElementById("userListContent");
  if (!saved) {
    box.innerText = "❌ No list saved yet.";
  } else {
    const data = JSON.parse(saved);
    box.innerText = data.original || "❌ Original list not found.";
  }
  document.getElementById("userListPopup").style.display = "flex";
}

function copyUserList() {
  const text = document.getElementById("userListContent").innerText;
  navigator.clipboard.writeText(text).then(() => showToast("📋 Userlist copied!", "#00c853"));
}

function showBottomPopup() {
  document.getElementById('bottomLinkPopup').style.display = 'flex';
}
function hideBottomPopup(e) {
  document.getElementById('bottomLinkPopup').style.display = 'none';
}

window.onload = () => {
  const saved = localStorage.getItem("amit_user_data");
  if (saved) {
    userData = JSON.parse(saved);
    showList();
  }
  toggleSection("home");
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function (registration) {
      console.log('ServiceWorker registered: ', registration);
    }).catch(function (error) {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("amit_dark_mode", document.body.classList.contains("dark"));
}

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("amit_dark_mode") === "true") {
    document.body.classList.add("dark");
  }
});
