document.addEventListener("DOMContentLoaded", () => {
const btn = document.createElement("button");
btn.textContent = "Send Message";
btn.style.cssText =
"padding:12px 20px;border:none;border-radius:8px;background:#2c2c2c;color:#fff;font-size:16px;cursor:pointer;margin:20px auto;display:block;";
btn.onclick = () => alert("Thank you for reaching out! I will contact you soon.");
document.body.appendChild(btn);
});