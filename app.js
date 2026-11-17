"use strict";

const form = document.querySelector("#solver-form");
const inputA = document.querySelector("#coefficient-a");
const inputB = document.querySelector("#coefficient-b");
const inputC = document.querySelector("#coefficient-c");
const equationPreview = document.querySelector("#equation-preview");
const resultContent = document.querySelector("#result-content");
const formMessage = document.querySelector("#form-message");
const feedbackNote = document.querySelector("#feedback-note");
const feedbackStatus = document.querySelector("#feedback-status");

function updateEquationPreview() {
    const values = [inputA.value, inputB.value, inputC.value];
    if (values.some((value) => value.trim() === "")) {
        equationPreview.textContent = "Enter a, b and c to preview your equation.";
        return;
    }

    const [a, b, c] = values.map(Number);
    if (![a, b, c].every(Number.isFinite)) {
        equationPreview.textContent = "Enter three finite numbers to preview your equation.";
        return;
    }

    equationPreview.textContent = MathLabSolver.formatEquation(a, b, c);
}

function showMessage(message) {
    formMessage.textContent = message;
    formMessage.classList.toggle("visible", Boolean(message));
}

function displayResult(title, a, b, c, steps, answer) {
    resultContent.replaceChildren();

    const heading = document.createElement("h3");
    heading.className = "result-title";
    heading.textContent = title;
    resultContent.append(heading);

    const equation = document.createElement("p");
    equation.className = "equation-line";
    equation.textContent = `Equation: ${MathLabSolver.formatEquation(a, b, c)}`;
    resultContent.append(equation);

    const list = document.createElement("ol");
    list.className = "step-list";
    steps.forEach((step) => {
        const item = document.createElement("li");
        item.textContent = step;
        if (step.startsWith("   ") || step.startsWith("       ")) {
            item.classList.add("substep");
        }
        list.append(item);
    });
    resultContent.append(list);

    if (answer) {
        const answerBox = document.createElement("div");
        answerBox.className = "answer-box";
        answerBox.textContent = answer;
        resultContent.append(answerBox);
    }
}

function solve(event) {
    if (event) {
        event.preventDefault();
    }
    showMessage("");

    const values = [inputA.value, inputB.value, inputC.value];
    if (values.some((value) => value.trim() === "")) {
        showMessage("Please enter a number in each box.");
        return;
    }

    const [a, b, c] = values.map(Number);
    if (![a, b, c].every(Number.isFinite)) {
        showMessage("Please enter ordinary finite numbers in all three boxes.");
        return;
    }
    if (a === 0) {
        showMessage("a cannot be 0. If a = 0, the equation is not quadratic.");
        inputA.focus();
        return;
    }

    const method = form.elements.method.value;
    const solveMethod = method === "square"
        ? MathLabSolver.solveCompletingSquare
        : MathLabSolver.solveQuadraticFormula;

    try {
        const result = solveMethod(a, b, c);
        const methodTitle = method === "square"
            ? "Completing the Square Method"
            : "Quadratic Formula Method";
        let answer;
        if (result.roots === null) {
            answer = "Answer: no real-number solutions.";
        } else if (result.roots[0] === result.roots[1]) {
            answer = `Answer: x = ${MathLabSolver.formatNumber(result.roots[0])} (repeated root)`;
        } else {
            answer = `Answer: x = ${MathLabSolver.formatNumber(result.roots[0])} and x = ${MathLabSolver.formatNumber(result.roots[1])}`;
        }
        displayResult(methodTitle, a, b, c, result.steps, answer);
    } catch (error) {
        showMessage(error.message || "The equation could not be solved. Please check the numbers.");
    }
}

function showGuide() {
    document.querySelector(".guide-card").open = true;
    document.querySelector(".guide-card").scrollIntoView({ behavior: "smooth", block: "center" });
}

function loadExample() {
    inputA.value = "1";
    inputB.value = "-5";
    inputC.value = "6";
    form.elements.method.value = "formula";
    updateEquationPreview();
    solve();
    document.querySelector("#working-title").scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearInputs() {
    inputA.value = "";
    inputB.value = "";
    inputC.value = "";
    showMessage("");
    updateEquationPreview();
    resultContent.replaceChildren();
    const welcome = document.createElement("div");
    welcome.className = "welcome-state";
    const heading = document.createElement("h3");
    heading.textContent = "Ready for a new question";
    const text = document.createElement("p");
    text.textContent = "Enter a, b and c, choose a method and press Solve step by step.";
    welcome.append(heading, text);
    resultContent.append(welcome);
    inputA.focus();
}

async function copyFeedback() {
    const note = feedbackNote.value.trim();
    if (!note) {
        feedbackStatus.textContent = "Type your question or feedback first.";
        feedbackNote.focus();
        return;
    }

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(note);
        } else {
            const temporaryInput = document.createElement("textarea");
            temporaryInput.value = note;
            temporaryInput.setAttribute("readonly", "");
            temporaryInput.style.position = "fixed";
            temporaryInput.style.opacity = "0";
            document.body.append(temporaryInput);
            temporaryInput.select();
            const copied = document.execCommand("copy");
            temporaryInput.remove();
            if (!copied) {
                throw new Error("Copy is not available in this browser. Please select and copy your note manually.");
            }
        }
        feedbackStatus.textContent = "Copied. Paste your note into a message to your teacher.";
    } catch (error) {
        feedbackStatus.textContent = error.message || "Could not copy the note. Please select and copy it manually.";
    }
}

form.addEventListener("submit", solve);
document.querySelector("#explain-button").addEventListener("click", showGuide);
document.querySelector("#example-button").addEventListener("click", loadExample);
document.querySelector("#clear-button").addEventListener("click", clearInputs);
document.querySelector("#copy-feedback-button").addEventListener("click", copyFeedback);
[inputA, inputB, inputC].forEach((input) => input.addEventListener("input", updateEquationPreview));
