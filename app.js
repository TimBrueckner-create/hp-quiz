const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  result: document.getElementById("resultScreen")
};

const elements = {
  setupForm: document.getElementById("setupForm"),
  categorySelect: document.getElementById("categorySelect"),
  roundLength: document.getElementById("roundLength"),
  playerOne: document.getElementById("playerOne"),
  playerTwo: document.getElementById("playerTwo"),
  duelFields: document.getElementById("duelFields"),
  homeBest: document.getElementById("homeBest"),
  questionTotal: document.getElementById("questionTotal"),
  poolLabel: document.getElementById("poolLabel"),
  offlineState: document.getElementById("offlineState"),
  progressLabel: document.getElementById("progressLabel"),
  progressBar: document.getElementById("progressBar"),
  scoreChipLabel: document.getElementById("scoreChipLabel"),
  scoreLabel: document.getElementById("scoreLabel"),
  turnBanner: document.getElementById("turnBanner"),
  categoryLabel: document.getElementById("categoryLabel"),
  difficultyLabel: document.getElementById("difficultyLabel"),
  questionText: document.getElementById("questionText"),
  answers: document.getElementById("answers"),
  feedback: document.getElementById("feedback"),
  hintButton: document.getElementById("hintButton"),
  nextButton: document.getElementById("nextButton"),
  quitButton: document.getElementById("quitButton"),
  finalScoreLabel: document.getElementById("finalScoreLabel"),
  finalCorrectLabel: document.getElementById("finalCorrectLabel"),
  finalScore: document.getElementById("finalScore"),
  finalCorrect: document.getElementById("finalCorrect"),
  resultText: document.getElementById("resultText"),
  playAgainButton: document.getElementById("playAgainButton"),
  modeCards: [...document.querySelectorAll(".mode-card")]
};

const state = {
  mode: "solo",
  deck: [],
  index: 0,
  score: 0,
  correct: 0,
  answered: false,
  hintIndex: 0,
  players: [
    { name: "Spieler 1", score: 0, correct: 0 },
    { name: "Spieler 2", score: 0, correct: 0 }
  ],
  activePlayer: 0
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

function getPool() {
  return state.mode === "mystery" ? window.MYSTERY_ITEMS : window.QUIZ_QUESTIONS;
}

function fillCategories() {
  const pool = getPool();
  const categories = ["Alle", ...new Set(pool.map((item) => item.category))].sort((a, b) => {
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
  elements.poolLabel.textContent = state.mode === "mystery" ? "Geheimnisse" : "Fragen";
  elements.questionTotal.textContent = String(getPool().length);
  elements.duelFields.hidden = state.mode !== "duel";
}

function selectMode(mode) {
  state.mode = mode;
  elements.modeCards.forEach((card) => {
    card.classList.toggle("mode-card-active", card.dataset.mode === mode);
  });
  fillCategories();
  updateHome();
}

function pointValue(difficulty) {
  if (difficulty === "schwer") return 30;
  if (difficulty === "mittel") return 20;
  return 10;
}

function startRound(category, length) {
  const pool = getPool();
  const filtered = category === "Alle" ? pool : pool.filter((item) => item.category === category);
  state.deck = shuffle(filtered).slice(0, Math.min(length, filtered.length));
  state.index = 0;
  state.score = 0;
  state.correct = 0;
  state.answered = false;
  state.hintIndex = 0;
  state.activePlayer = 0;
  state.players = [
    { name: elements.playerOne.value.trim() || "Spieler 1", score: 0, correct: 0 },
    { name: elements.playerTwo.value.trim() || "Spieler 2", score: 0, correct: 0 }
  ];
  showScreen("game");
  renderCurrent();
}

function renderCurrent() {
  if (state.mode === "mystery") {
    renderMystery();
  } else {
    renderQuestion();
  }
}

function updateSharedHeader(total) {
  elements.progressLabel.textContent = `${state.mode === "mystery" ? "Geheimnis" : "Frage"} ${state.index + 1} von ${total}`;
  elements.progressBar.style.width = `${(state.index / total) * 100}%`;
  elements.feedback.textContent = "";
  elements.nextButton.disabled = true;
  elements.hintButton.hidden = state.mode !== "mystery";

  if (state.mode === "duel") {
    const player = state.players[state.activePlayer];
    elements.turnBanner.hidden = false;
    elements.turnBanner.textContent = `${player.name} ist dran`;
    elements.scoreChipLabel.textContent = player.name;
    elements.scoreLabel.textContent = String(player.score);
  } else {
    elements.turnBanner.hidden = true;
    elements.scoreChipLabel.textContent = "Punkte";
    elements.scoreLabel.textContent = String(state.score);
  }
}

function renderQuestion() {
  const current = state.deck[state.index];
  const total = state.deck.length;
  state.answered = false;
  updateSharedHeader(total);
  elements.hintButton.hidden = true;
  elements.categoryLabel.textContent = current.category;
  elements.difficultyLabel.textContent = current.difficulty;
  elements.questionText.textContent = current.question;
  elements.nextButton.textContent = state.mode === "duel" ? "Weitergeben" : "Nächste Frage";

  elements.answers.innerHTML = "";
  shuffle(current.answers.map((answer, answerIndex) => ({ answer, answerIndex }))).forEach((choice) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.textContent = choice.answer;
    button.addEventListener("click", () => chooseQuizAnswer(button, choice.answerIndex));
    elements.answers.appendChild(button);
  });
}

function chooseQuizAnswer(button, answerIndex) {
  if (state.answered) return;

  const current = state.deck[state.index];
  const buttons = [...elements.answers.querySelectorAll("button")];
  const correct = answerIndex === current.correct;
  state.answered = true;

  buttons.forEach((answerButton) => {
    answerButton.disabled = true;
    if (answerButton.textContent === current.answers[current.correct]) answerButton.classList.add("correct");
  });

  if (correct) {
    awardPoints(pointValue(current.difficulty));
    button.classList.add("correct");
    elements.feedback.textContent = "Richtig.";
  } else {
    button.classList.add("wrong");
    elements.feedback.textContent = `Nicht ganz. Richtig wäre: ${current.answers[current.correct]}.`;
  }

  refreshScore();
  elements.progressBar.style.width = `${((state.index + 1) / state.deck.length) * 100}%`;
  elements.nextButton.disabled = false;
}

function renderMystery() {
  const current = state.deck[state.index];
  const total = state.deck.length;
  state.answered = false;
  state.hintIndex = 0;
  updateSharedHeader(total);
  elements.categoryLabel.textContent = current.category;
  elements.difficultyLabel.textContent = `${current.hints.length} Hinweise`;
  elements.nextButton.textContent = "Nächstes Geheimnis";
  renderMysteryHint();

  const choices = shuffle([
    current.name,
    ...shuffle(window.MYSTERY_ITEMS.filter((item) => item.name !== current.name)).slice(0, 3).map((item) => item.name)
  ]);

  elements.answers.innerHTML = "";
  choices.forEach((answer) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.textContent = answer;
    button.addEventListener("click", () => chooseMysteryAnswer(button, answer));
    elements.answers.appendChild(button);
  });
}

function renderMysteryHint() {
  const current = state.deck[state.index];
  elements.questionText.textContent = current.hints[state.hintIndex];
  elements.feedback.textContent = `Hinweis ${state.hintIndex + 1} von ${current.hints.length}`;
  elements.hintButton.disabled = state.hintIndex >= current.hints.length - 1;
}

function chooseMysteryAnswer(button, answer) {
  if (state.answered) return;

  const current = state.deck[state.index];
  const buttons = [...elements.answers.querySelectorAll("button")];
  const correct = answer === current.name;
  state.answered = true;

  buttons.forEach((answerButton) => {
    answerButton.disabled = true;
    if (answerButton.textContent === current.name) answerButton.classList.add("correct");
  });

  if (correct) {
    const points = Math.max(10, 40 - state.hintIndex * 10);
    awardPoints(points);
    button.classList.add("correct");
    elements.feedback.textContent = `Richtig. ${points} Punkte für dieses Geheimnis.`;
  } else {
    button.classList.add("wrong");
    elements.feedback.textContent = `Gelöst wäre: ${current.name}.`;
  }

  refreshScore();
  elements.progressBar.style.width = `${((state.index + 1) / state.deck.length) * 100}%`;
  elements.hintButton.disabled = true;
  elements.nextButton.disabled = false;
}

function awardPoints(points) {
  if (state.mode === "duel") {
    state.players[state.activePlayer].score += points;
    state.players[state.activePlayer].correct += 1;
    return;
  }
  state.score += points;
  state.correct += 1;
}

function refreshScore() {
  if (state.mode === "duel") {
    elements.scoreLabel.textContent = String(state.players[state.activePlayer].score);
  } else {
    elements.scoreLabel.textContent = String(state.score);
  }
}

function advanceRound() {
  if (state.index + 1 >= state.deck.length) {
    finishRound();
    return;
  }
  state.index += 1;
  if (state.mode === "duel") {
    state.activePlayer = state.activePlayer === 0 ? 1 : 0;
  }
  renderCurrent();
}

function finishRound() {
  if (state.mode === "duel") {
    const [one, two] = state.players;
    const winner = one.score === two.score ? "Unentschieden" : one.score > two.score ? one.name : two.name;
    elements.finalScoreLabel.textContent = one.name;
    elements.finalScore.textContent = String(one.score);
    elements.finalCorrectLabel.textContent = two.name;
    elements.finalCorrect.textContent = String(two.score);
    elements.resultText.textContent = winner === "Unentschieden"
      ? "Der Hauspokal wird geteilt. Das riecht nach Rückrunde."
      : `${winner} gewinnt den Hauspokal.`;
    showScreen("result");
    return;
  }

  const isRecord = setBestScore(state.score);
  elements.finalScoreLabel.textContent = "Punkte";
  elements.finalCorrectLabel.textContent = "Richtig";
  elements.finalScore.textContent = String(state.score);
  elements.finalCorrect.textContent = `${state.correct}/${state.deck.length}`;
  elements.resultText.textContent = isRecord
    ? "Neuer Bestwert. Diese Runde sitzt."
    : "Runde gespeichert. Noch eine Runde kann den Bestwert knacken.";
  updateHome();
  showScreen("result");
}

elements.modeCards.forEach((card) => {
  card.addEventListener("click", () => selectMode(card.dataset.mode));
});

elements.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startRound(elements.categorySelect.value, Number(elements.roundLength.value));
});

elements.nextButton.addEventListener("click", advanceRound);

elements.hintButton.addEventListener("click", () => {
  const current = state.deck[state.index];
  if (state.hintIndex < current.hints.length - 1) {
    state.hintIndex += 1;
    renderMysteryHint();
  }
});

elements.quitButton.addEventListener("click", () => showScreen("start"));
elements.playAgainButton.addEventListener("click", () => showScreen("start"));

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
