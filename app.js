const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  result: document.getElementById("resultScreen")
};

const elements = {
  setupForm: document.getElementById("setupForm"),
  categorySelect: document.getElementById("categorySelect"),
  roundLength: document.getElementById("roundLength"),
  homeBest: document.getElementById("homeBest"),
  questionTotal: document.getElementById("questionTotal"),
  offlineState: document.getElementById("offlineState"),
  progressLabel: document.getElementById("progressLabel"),
  progressBar: document.getElementById("progressBar"),
  scoreLabel: document.getElementById("scoreLabel"),
  categoryLabel: document.getElementById("categoryLabel"),
  difficultyLabel: document.getElementById("difficultyLabel"),
  questionText: document.getElementById("questionText"),
  answers: document.getElementById("answers"),
  feedback: document.getElementById("feedback"),
  nextButton: document.getElementById("nextButton"),
  quitButton: document.getElementById("quitButton"),
  finalScore: document.getElementById("finalScore"),
  finalCorrect: document.getElementById("finalCorrect"),
  resultText: document.getElementById("resultText"),
  playAgainButton: document.getElementById("playAgainButton")
};

const state = {
  deck: [],
  index: 0,
  score: 0,
  correct: 0,
  answered: false
};

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("screen-active"));
  screens[name].classList.add("screen-active");
}

function getBestScore() {
  return Number(localStorage.getItem("zauberquiz-best") || 0);
}

function setBestScore(score) {
  const best = getBestScore();
  if (score > best) {
    localStorage.setItem("zauberquiz-best", String(score));
    return true;
  }
  return false;
}

function fillCategories() {
  const categories = ["Alle", ...new Set(window.QUIZ_QUESTIONS.map((question) => question.category))].sort((a, b) => {
    if (a === "Alle") return -1;
    if (b === "Alle") return 1;
    return a.localeCompare(b, "de");
  });

  elements.categorySelect.innerHTML = categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}

function updateHome() {
  elements.homeBest.textContent = String(getBestScore());
  elements.questionTotal.textContent = String(window.QUIZ_QUESTIONS.length);
}

function startRound(category, length) {
  const filtered = category === "Alle"
    ? window.QUIZ_QUESTIONS
    : window.QUIZ_QUESTIONS.filter((question) => question.category === category);

  state.deck = shuffle(filtered).slice(0, Math.min(length, filtered.length));
  state.index = 0;
  state.score = 0;
  state.correct = 0;
  state.answered = false;
  showScreen("game");
  renderQuestion();
}

function renderQuestion() {
  const current = state.deck[state.index];
  const total = state.deck.length;
  state.answered = false;

  elements.progressLabel.textContent = `Frage ${state.index + 1} von ${total}`;
  elements.progressBar.style.width = `${(state.index / total) * 100}%`;
  elements.scoreLabel.textContent = String(state.score);
  elements.categoryLabel.textContent = current.category;
  elements.difficultyLabel.textContent = current.difficulty;
  elements.questionText.textContent = current.question;
  elements.feedback.textContent = "";
  elements.nextButton.disabled = true;

  elements.answers.innerHTML = "";
  current.answers.forEach((answer, answerIndex) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.textContent = answer;
    button.addEventListener("click", () => chooseAnswer(button, answerIndex));
    elements.answers.appendChild(button);
  });
}

function chooseAnswer(button, answerIndex) {
  if (state.answered) return;

  const current = state.deck[state.index];
  const buttons = [...elements.answers.querySelectorAll("button")];
  state.answered = true;

  buttons.forEach((answerButton, index) => {
    answerButton.disabled = true;
    if (index === current.correct) answerButton.classList.add("correct");
  });

  if (answerIndex === current.correct) {
    state.correct += 1;
    state.score += current.difficulty === "schwer" ? 30 : current.difficulty === "mittel" ? 20 : 10;
    button.classList.add("correct");
    elements.feedback.textContent = "Richtig.";
  } else {
    button.classList.add("wrong");
    elements.feedback.textContent = `Nicht ganz. Richtig waere: ${current.answers[current.correct]}.`;
  }

  elements.scoreLabel.textContent = String(state.score);
  elements.progressBar.style.width = `${((state.index + 1) / state.deck.length) * 100}%`;
  elements.nextButton.disabled = false;
}

function finishRound() {
  const isRecord = setBestScore(state.score);
  elements.finalScore.textContent = String(state.score);
  elements.finalCorrect.textContent = `${state.correct}/${state.deck.length}`;
  elements.resultText.textContent = isRecord
    ? "Neuer Bestwert. Diese Runde sitzt."
    : "Runde gespeichert. Noch eine Runde kann den Bestwert knacken.";
  updateHome();
  showScreen("result");
}

elements.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startRound(elements.categorySelect.value, Number(elements.roundLength.value));
});

elements.nextButton.addEventListener("click", () => {
  if (state.index + 1 >= state.deck.length) {
    finishRound();
    return;
  }
  state.index += 1;
  renderQuestion();
});

elements.quitButton.addEventListener("click", () => {
  showScreen("start");
});

elements.playAgainButton.addEventListener("click", () => {
  showScreen("start");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
      elements.offlineState.textContent = "Offline installiert";
    } catch {
      elements.offlineState.textContent = "Offline im Browser";
    }
  });
}

fillCategories();
updateHome();
