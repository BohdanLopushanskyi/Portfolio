/* ------------ CALCULATOR LOGIC ------------ */
const display = document.getElementById('display');

function press(value) {
    display.value += value;
}

function pressOperator(op) {
    const last = display.value.slice(-1);
    if ("+-*/".includes(last)) {
        display.value = display.value.slice(0, -1) + op;
    } else if (display.value.length > 0) {
        display.value += op;
    }
}

function clearDisplay() {
    display.value = "";
}

function calculate() {
    const expression = display.value;
    if (!expression) return;

    try {
        const result = Function("return " + expression)();
        display.value = result;
    } catch {
        display.value = "Error";
    }
}

/* ------------ MANY FLOATING FORMULAS ------------ */
const formulas = [
    "E = mc²", "a² + b² = c²", "π = 3.14159…", "sin(x) + cos(x)",
    "∫ x² dx", "f(x) = x³ - 2x", "lim(x→0) sin(x)/x = 1",
    "√(a² + b²)", "Δ = b² - 4ac", "φ = 1.618…",
    "x = (-b ± √(b² - 4ac)) / 2a", "Σ (1/n²) = π²/6",
    "e^{iπ} + 1 = 0", "log(a·b) = log(a) + log(b)",
    "d/dx (x²) = 2x", "tan(x) = sin(x)/cos(x)",
    "∫ e^x dx = e^x + C", "∇ · E = ρ/ε₀",
    "F = G(m₁m₂)/r²", "v = s/t",
    "PV = nRT", "λ = h/p", "y = mx + b"
];

const container = document.getElementById("formulaContainer");

/* Create 40 formulas */
for (let i = 0; i < 40; i++) {
    const f = document.createElement("div");
    f.className = "formula";
    f.textContent = formulas[Math.floor(Math.random() * formulas.length)];

    f.style.left = Math.random() * 100 + "%";
    f.style.fontSize = (18 + Math.random() * 20) + "px";
    f.style.animationDuration = (12 + Math.random() * 18) + "s";
    f.style.animationDelay = Math.random() * 10 + "s";
    f.style.opacity = 0.15 + Math.random() * 0.25;

    container.appendChild(f);
}