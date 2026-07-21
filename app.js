const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  result: document.getElementById("resultScreen")
};

const elements = {
  setupForm: document.getElementById("setupForm"),
  soloHouseField: document.getElementById("soloHouseField"),
  houseSelect: document.getElementById("houseSelect"),
  categorySelect: document.getElementById("categorySelect"),
  categoryChoices: document.getElementById("categoryChoices"),
  roundLength: document.getElementById("roundLength"),
  roundChoices: [...document.querySelectorAll("[data-round-length]")],
  difficultySelect: document.getElementById("difficultySelect"),
  difficultyChoices: [...document.querySelectorAll("[data-difficulty]")],
  playerOne: document.getElementById("playerOne"),
  playerTwo: document.getElementById("playerTwo"),
  playerTwoCard: document.getElementById("playerTwoCard"),
  playerTwoLabel: document.getElementById("playerTwoLabel"),
  playerHelp: document.getElementById("playerHelp"),
  duelFields: document.getElementById("duelFields"),
  homeBest: document.getElementById("homeBest"),
  questionTotal: document.getElementById("questionTotal"),
  poolLabel: document.getElementById("poolLabel"),
  offlineState: document.getElementById("offlineState"),
  progressLabel: document.getElementById("progressLabel"),
  progressBar: document.getElementById("progressBar"),
  scoreChipLabel: document.getElementById("scoreChipLabel"),
  scoreLabel: document.getElementById("scoreLabel"),
  duelBoard: document.getElementById("duelBoard"),
  duelRoundLabel: document.getElementById("duelRoundLabel"),
  duelCategoryLabel: document.getElementById("duelCategoryLabel"),
  duelNameOne: document.getElementById("duelNameOne"),
  duelScoreOne: document.getElementById("duelScoreOne"),
  duelHouseOne: document.getElementById("duelHouseOne"),
  duelNameTwo: document.getElementById("duelNameTwo"),
  duelScoreTwo: document.getElementById("duelScoreTwo"),
  duelHouseTwo: document.getElementById("duelHouseTwo"),
  buzzerStatus: document.getElementById("buzzerStatus"),
  buzzerPanel: document.getElementById("buzzerPanel"),
  buzzerOne: document.getElementById("buzzerOne"),
  buzzerTwo: document.getElementById("buzzerTwo"),
  buzzerOneHouse: document.getElementById("buzzerOneHouse"),
  buzzerTwoHouse: document.getElementById("buzzerTwoHouse"),
  buzzerOneName: document.getElementById("buzzerOneName"),
  buzzerTwoName: document.getElementById("buzzerTwoName"),
  buzzerCenterLabel: document.getElementById("buzzerCenterLabel"),
  buzzerCountdown: document.getElementById("buzzerCountdown"),
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
  resultTrophy: document.getElementById("resultTrophy"),
  resultHouseLabel: document.getElementById("resultHouseLabel"),
  resultText: document.getElementById("resultText"),
  startButton: document.getElementById("startButton"),
  playAgainButton: document.getElementById("playAgainButton"),
  modeCards: [...document.querySelectorAll(".mode-card")],
  houseChoices: [...document.querySelectorAll(".house-choice[data-player]")],
  soloHouseChoices: [...document.querySelectorAll(".house-choice[data-solo-house]")]
};

const HOUSE_NAMES = {
  gryffindor: "Gryffindor",
  slytherin: "Slytherin",
  ravenclaw: "Ravenclaw",
  hufflepuff: "Hufflepuff"
};

const HOUSE_INITIALS = {
  gryffindor: "G",
  slytherin: "S",
  ravenclaw: "R",
  hufflepuff: "H"
};

const MODE_LABELS = {
  solo: "Quizrunde starten",
  duel: "Zum Duell antreten",
  mystery: "Rätselrunde starten",
  buzzer: "Buzzerduell starten"
};

const BUZZER_SECONDS = 12;

const state = {
  mode: "solo",
  house: localStorage.getItem("zauberquiz-house") || "gryffindor",
  playerHouses: [
    localStorage.getItem("zauberquiz-player-one-house") || "gryffindor",
    localStorage.getItem("zauberquiz-player-two-house") || "slytherin"
  ],
  deck: [],
  index: 0,
  score: 0,
  correct: 0,
  answered: false,
  hintIndex: 0,
  buzzerTimer: null,
  buzzerTimeLeft: BUZZER_SECONDS,
  buzzerAttempts: [],
  buzzerAnswering: null,
  buzzerPhase: "waiting",
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

function applyHouse(house) {
  state.house = house;
  document.body.dataset.house = house;
  elements.houseSelect.value = house;
  localStorage.setItem("zauberquiz-house", house);
  renderHouseChoices();
}

function setVisualHouse(house) {
  document.body.dataset.house = house;
}

function setPlayerHouse(playerIndex, house) {
  state.playerHouses[playerIndex] = house;
  localStorage.setItem(playerIndex === 0 ? "zauberquiz-player-one-house" : "zauberquiz-player-two-house", house);
  renderHouseChoices();
  if (state.mode === "duel") setVisualHouse(house);
}

function setFeedback(kind, title, detail = "") {
  const titleNode = document.createElement("span");
  titleNode.textContent = title;
  elements.feedback.className = `feedback feedback-${kind}`;
  elements.feedback.replaceChildren(titleNode);

  if (detail) {
    const detailNode = document.createElement("strong");
    detailNode.textContent = detail;
    elements.feedback.appendChild(detailNode);
  }
}

function renderHouseChoices() {
  elements.houseChoices.forEach((choice) => {
    const playerIndex = Number(choice.dataset.player);
    const isSelected = state.playerHouses[playerIndex] === choice.dataset.house;
    choice.classList.toggle("house-choice-active", isSelected);
    choice.setAttribute("aria-pressed", String(isSelected));
  });
  elements.soloHouseChoices.forEach((choice) => {
    const isSelected = state.house === choice.dataset.soloHouse;
    choice.classList.toggle("house-choice-active", isSelected);
    choice.setAttribute("aria-pressed", String(isSelected));
  });
}

function getPool() {
  return state.mode === "mystery" ? window.MYSTERY_ITEMS : window.QUIZ_QUESTIONS;
}

function isTwoPlayerMode() {
  return state.mode === "duel" || state.mode === "buzzer";
}

function fillCategories() {
  const pool = getPool();
  const selectedCategory = elements.categorySelect.value || "Alle";
  const categories = ["Alle", ...new Set(pool.map((item) => item.category))].sort((a, b) => {
    if (a === "Alle") return -1;
    if (b === "Alle") return 1;
    return a.localeCompare(b, "de");
  });

  elements.categorySelect.innerHTML = categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
  elements.categorySelect.value = categories.includes(selectedCategory) ? selectedCategory : "Alle";
  renderCategoryChoices(categories);
}

function renderCategoryChoices(categories) {
  elements.categoryChoices.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = category;
    button.className = "choice-chip";
    button.dataset.category = category;
    button.classList.toggle("choice-chip-active", elements.categorySelect.value === category);
    button.setAttribute("aria-pressed", String(elements.categorySelect.value === category));
    button.addEventListener("click", () => {
      elements.categorySelect.value = category;
      renderCategoryChoices(categories);
    });
    elements.categoryChoices.appendChild(button);
  });
}

function renderRoundChoices() {
  elements.roundChoices.forEach((button) => {
    const isSelected = elements.roundLength.value === button.dataset.roundLength;
    button.classList.toggle("choice-chip-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function renderDifficultyChoices() {
  elements.difficultyChoices.forEach((button) => {
    const isSelected = elements.difficultySelect.value === button.dataset.difficulty;
    button.classList.toggle("choice-chip-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function updateHome() {
  elements.homeBest.textContent = String(getBestScore());
  elements.poolLabel.textContent = state.mode === "mystery" ? "Hinweispool" : "Fragenpool";
  elements.questionTotal.textContent = `${getPool().length} ${state.mode === "mystery" ? "Geheimnisse" : "Fragen"}`;
  elements.duelFields.hidden = !isTwoPlayerMode();
  elements.playerTwoCard.hidden = !isTwoPlayerMode();
  elements.playerTwoLabel.textContent = isTwoPlayerMode() ? "Spieler 2" : "Spieler 2 (optional)";
  elements.playerHelp.hidden = true;
  elements.soloHouseField.hidden = isTwoPlayerMode();
  elements.startButton.innerHTML = `<span aria-hidden="true">${isTwoPlayerMode() ? "⚔" : "✦"}</span> ${MODE_LABELS[state.mode]}`;
}

function selectMode(mode) {
  state.mode = mode;
  document.body.dataset.mode = mode;
  elements.modeCards.forEach((card) => {
    card.classList.toggle("mode-card-active", card.dataset.mode === mode);
    card.setAttribute("aria-pressed", String(card.dataset.mode === mode));
  });
  setVisualHouse(isTwoPlayerMode() ? state.playerHouses[0] : state.house);
  fillCategories();
  updateHome();
}

function pointValue(difficulty) {
  if (difficulty === "schwer") return 30;
  if (difficulty === "mittel") return 20;
  return 10;
}

function startRound(category, length, difficulty) {
  const pool = getPool();
  const filtered = pool.filter((item) => {
    const categoryMatches = category === "Alle" || item.category === category;
    const difficultyMatches = state.mode === "mystery" || difficulty === "Alle" || item.difficulty === difficulty;
    return categoryMatches && difficultyMatches;
  });
  state.deck = shuffle(filtered).slice(0, Math.min(length, filtered.length));
  state.index = 0;
  state.score = 0;
  state.correct = 0;
  state.answered = false;
  state.hintIndex = 0;
  state.buzzerAttempts = [];
  state.buzzerAnswering = null;
  state.buzzerPhase = "waiting";
  stopBuzzerTimer();
  state.activePlayer = 0;
  state.players = [
    { name: elements.playerOne.value.trim() || "Spieler 1", house: state.playerHouses[0], score: 0, correct: 0 },
    { name: elements.playerTwo.value.trim() || "Spieler 2", house: state.playerHouses[1], score: 0, correct: 0 }
  ];
  setVisualHouse(isTwoPlayerMode() ? state.players[0].house : state.house);
  showScreen("game");
  renderCurrent();
}

function renderCurrent() {
  if (state.mode === "buzzer") {
    renderBuzzerQuestion();
  } else if (state.mode === "mystery") {
    renderMystery();
  } else {
    renderQuestion();
  }
}

function updateSharedHeader(total) {
  elements.progressLabel.textContent = `${state.mode === "mystery" ? "Geheimnis" : "Frage"} ${state.index + 1} von ${total}`;
  elements.progressBar.style.width = `${(state.index / total) * 100}%`;
  elements.feedback.className = "feedback";
  elements.feedback.textContent = "";
  elements.nextButton.disabled = true;
  elements.nextButton.hidden = state.mode === "buzzer";
  elements.hintButton.hidden = state.mode !== "mystery";
  elements.buzzerPanel.hidden = true;
  elements.buzzerStatus.hidden = true;

  if (isTwoPlayerMode()) {
    const player = state.players[state.activePlayer];
    setVisualHouse(player.house);
    elements.duelBoard.hidden = false;
    elements.turnBanner.hidden = state.mode === "buzzer";
    elements.turnBanner.textContent = `${player.name} spielt für ${HOUSE_NAMES[player.house]}`;
    elements.scoreChipLabel.textContent = player.name;
    elements.scoreLabel.textContent = String(player.score);
  } else {
    elements.duelBoard.hidden = true;
    elements.turnBanner.hidden = true;
    elements.scoreChipLabel.textContent = "Punkte";
    elements.scoreLabel.textContent = String(state.score);
  }
}

function updateDuelBoard(current) {
  if (!isTwoPlayerMode()) return;

  const [one, two] = state.players;
  elements.duelRoundLabel.textContent = `Runde ${state.index + 1}`;
  elements.duelCategoryLabel.textContent = state.mode === "buzzer" ? "" : `Kategorie: ${current.category}`;
  elements.duelCategoryLabel.hidden = state.mode === "buzzer";
  elements.duelNameOne.textContent = one.name;
  elements.duelScoreOne.textContent = String(one.score);
  elements.duelHouseOne.textContent = HOUSE_INITIALS[one.house];
  elements.duelHouseOne.dataset.house = one.house;
  elements.duelHouseOne.setAttribute("aria-label", HOUSE_NAMES[one.house]);
  elements.duelNameTwo.textContent = two.name;
  elements.duelScoreTwo.textContent = String(two.score);
  elements.duelHouseTwo.textContent = HOUSE_INITIALS[two.house];
  elements.duelHouseTwo.dataset.house = two.house;
  elements.duelHouseTwo.setAttribute("aria-label", HOUSE_NAMES[two.house]);
  elements.duelNameOne.closest(".duel-player").classList.toggle("duel-player-active", state.mode === "buzzer" && state.buzzerAnswering === 0);
  elements.duelNameTwo.closest(".duel-player").classList.toggle("duel-player-active", state.mode === "buzzer" && state.buzzerAnswering === 1);
  updateVersusTimer();
}

function renderBuzzerQuestion() {
  const current = state.deck[state.index];
  const total = state.deck.length;
  state.answered = false;
  state.buzzerAttempts = [];
  state.buzzerAnswering = null;
  state.buzzerPhase = "waiting";
  stopBuzzerTimer();
  updateSharedHeader(total);
  updateDuelBoard(current);
  elements.categoryLabel.textContent = current.category;
  elements.difficultyLabel.textContent = current.difficulty;
  elements.categoryLabel.hidden = true;
  elements.difficultyLabel.hidden = true;
  elements.questionText.textContent = current.question;
  elements.answers.innerHTML = "";
  elements.answers.hidden = true;
  elements.nextButton.textContent = "Nächste Buzzerfrage";
  elements.nextButton.disabled = true;
  elements.nextButton.hidden = true;
  elements.buzzerPanel.hidden = false;
  elements.buzzerStatus.hidden = true;
  updateBuzzerButtons();
  elements.buzzerCenterLabel.textContent = "Bereit?";
  elements.buzzerCountdown.textContent = String(BUZZER_SECONDS);
  updateVersusTimer();
}

function setBuzzerStatus(title, detail = "") {
  elements.buzzerStatus.hidden = state.mode === "buzzer";
  elements.buzzerStatus.innerHTML = detail
    ? `<span>${title}</span><strong>${detail}</strong>`
    : `<span>${title}</span>`;
}

function updateVersusTimer() {
  const versus = document.querySelector(".duel-vs");
  if (!versus) return;
  const showTimer = state.mode === "buzzer" && state.buzzerPhase === "answering";
  versus.textContent = showTimer ? String(Math.max(0, state.buzzerTimeLeft)) : "VS";
  versus.classList.toggle("duel-vs-timer", showTimer);
}

function updateBuzzerButtons() {
  const [one, two] = state.players;
  elements.buzzerOneName.textContent = one.name;
  elements.buzzerTwoName.textContent = two.name;
  elements.buzzerOneHouse.textContent = HOUSE_INITIALS[one.house];
  elements.buzzerTwoHouse.textContent = HOUSE_INITIALS[two.house];
  elements.buzzerOneHouse.dataset.house = one.house;
  elements.buzzerTwoHouse.dataset.house = two.house;
  elements.buzzerOne.disabled = state.buzzerPhase !== "waiting" || state.buzzerAttempts.includes(0);
  elements.buzzerTwo.disabled = state.buzzerPhase !== "waiting" || state.buzzerAttempts.includes(1);
}

function buzz(playerIndex) {
  if (state.mode !== "buzzer" || state.buzzerPhase !== "waiting") return;
  state.activePlayer = playerIndex;
  state.buzzerAnswering = playerIndex;
  state.buzzerAttempts.push(playerIndex);
  state.buzzerPhase = "answering";
  setVisualHouse(state.players[playerIndex].house);
  updateDuelBoard(state.deck[state.index]);
  updateBuzzerButtons();
  renderBuzzerAnswers();
  startBuzzerTimer(BUZZER_SECONDS);
}

function renderBuzzerAnswers() {
  const current = state.deck[state.index];
  elements.buzzerPanel.hidden = true;
  elements.answers.hidden = false;
  elements.answers.innerHTML = "";
  shuffle(current.answers.map((answer, answerIndex) => ({ answer, answerIndex }))).forEach((choice) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.textContent = choice.answer;
    button.addEventListener("click", () => chooseBuzzerAnswer(button, choice.answerIndex));
    elements.answers.appendChild(button);
  });
  setBuzzerStatus(`${state.players[state.buzzerAnswering].name} antwortet`, `${state.buzzerTimeLeft} Sekunden`);
}

function startBuzzerTimer(seconds) {
  stopBuzzerTimer();
  state.buzzerTimeLeft = seconds;
  elements.buzzerCountdown.textContent = String(state.buzzerTimeLeft);
  updateVersusTimer();
  setBuzzerStatus(`${state.players[state.buzzerAnswering].name} antwortet`, `${state.buzzerTimeLeft} Sekunden`);
  state.buzzerTimer = window.setInterval(() => {
    state.buzzerTimeLeft -= 1;
    elements.buzzerCountdown.textContent = String(Math.max(0, state.buzzerTimeLeft));
    updateVersusTimer();
    setBuzzerStatus(`${state.players[state.buzzerAnswering].name} antwortet`, `${state.buzzerTimeLeft} Sekunden`);
    if (state.buzzerTimeLeft <= 0) {
      handleBuzzerMiss("Zeit abgelaufen");
    }
  }, 1000);
}

function stopBuzzerTimer() {
  if (state.buzzerTimer) {
    window.clearInterval(state.buzzerTimer);
    state.buzzerTimer = null;
  }
  updateVersusTimer();
}

function chooseBuzzerAnswer(button, answerIndex) {
  if (state.mode !== "buzzer" || state.buzzerPhase !== "answering") return;
  const current = state.deck[state.index];
  const correct = answerIndex === current.correct;

  if (correct) {
    stopBuzzerTimer();
    state.answered = true;
    state.buzzerPhase = "done";
    awardPoints(pointValue(current.difficulty));
    button.classList.add("correct");
    revealBuzzerAnswer(current);
    setBuzzerStatus("Richtig", `${pointValue(current.difficulty)} Punkte für ${state.players[state.buzzerAnswering].name}.`);
    refreshScore();
    elements.progressBar.style.width = `${((state.index + 1) / state.deck.length) * 100}%`;
    queueNextBuzzerQuestion();
  } else {
    button.classList.add("wrong");
    handleBuzzerMiss("Nicht richtig");
  }
}

function handleBuzzerMiss(reason) {
  if (state.mode !== "buzzer" || state.buzzerPhase !== "answering") return;
  stopBuzzerTimer();
  const otherPlayer = state.buzzerAnswering === 0 ? 1 : 0;

  if (!state.buzzerAttempts.includes(otherPlayer)) {
    state.buzzerPhase = "answering";
    state.activePlayer = otherPlayer;
    state.buzzerAnswering = otherPlayer;
    state.buzzerAttempts.push(otherPlayer);
    setVisualHouse(state.players[otherPlayer].house);
    updateDuelBoard(state.deck[state.index]);
    setBuzzerStatus(reason, `${state.players[otherPlayer].name} darf stehlen.`);
    updateBuzzerButtons();
    renderBuzzerAnswers();
    startBuzzerTimer(BUZZER_SECONDS);
    return;
  }

  state.answered = true;
  state.buzzerPhase = "done";
  elements.answers.hidden = false;
  revealBuzzerAnswer(state.deck[state.index]);
  setBuzzerStatus(reason, `Richtig wäre: ${state.deck[state.index].answers[state.deck[state.index].correct]}.`);
  elements.progressBar.style.width = `${((state.index + 1) / state.deck.length) * 100}%`;
  queueNextBuzzerQuestion();
}

function queueNextBuzzerQuestion() {
  window.setTimeout(() => {
    advanceRound();
  }, 1200);
}

function revealBuzzerAnswer(current) {
  [...elements.answers.querySelectorAll("button")].forEach((answerButton) => {
    answerButton.disabled = true;
    if (answerButton.textContent === current.answers[current.correct]) answerButton.classList.add("correct");
  });
  updateBuzzerButtons();
}

function renderQuestion() {
  const current = state.deck[state.index];
  const total = state.deck.length;
  state.answered = false;
  updateSharedHeader(total);
  elements.nextButton.hidden = false;
  updateDuelBoard(current);
  elements.categoryLabel.hidden = false;
  elements.difficultyLabel.hidden = false;
  elements.hintButton.hidden = true;
  elements.categoryLabel.textContent = current.category;
  elements.difficultyLabel.textContent = current.difficulty;
  elements.questionText.textContent = current.question;
  elements.nextButton.textContent = state.mode === "duel" ? "Weitergeben" : "Nächste Frage";

  elements.answers.innerHTML = "";
  elements.answers.hidden = false;
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
    setFeedback("correct", "Richtig", `${pointValue(current.difficulty)} Punkte für dein Haus.`);
  } else {
    button.classList.add("wrong");
    setFeedback("wrong", "Nicht ganz", `Richtig wäre: ${current.answers[current.correct]}.`);
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
  elements.nextButton.hidden = false;
  updateDuelBoard(current);
  elements.categoryLabel.hidden = false;
  elements.difficultyLabel.hidden = false;
  elements.categoryLabel.textContent = current.category;
  elements.difficultyLabel.textContent = `${current.hints.length} Hinweise`;
  elements.nextButton.textContent = "Nächstes Geheimnis";
  renderMysteryHint();

  const choices = shuffle([
    current.name,
    ...shuffle(window.MYSTERY_ITEMS.filter((item) => item.name !== current.name)).slice(0, 3).map((item) => item.name)
  ]);

  elements.answers.innerHTML = "";
  elements.answers.hidden = false;
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
  setFeedback("info", `Hinweis ${state.hintIndex + 1} von ${current.hints.length}`);
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
    setFeedback("correct", "Richtig", `${points} Punkte für dieses Geheimnis.`);
  } else {
    button.classList.add("wrong");
    setFeedback("wrong", "Nicht gelöst", `Gesucht war: ${current.name}.`);
  }

  refreshScore();
  elements.progressBar.style.width = `${((state.index + 1) / state.deck.length) * 100}%`;
  elements.hintButton.disabled = true;
  elements.nextButton.disabled = false;
}

function awardPoints(points) {
  if (isTwoPlayerMode()) {
    state.players[state.activePlayer].score += points;
    state.players[state.activePlayer].correct += 1;
    return;
  }
  state.score += points;
  state.correct += 1;
}

function refreshScore() {
  if (isTwoPlayerMode()) {
    elements.scoreLabel.textContent = String(state.players[state.activePlayer].score);
    updateDuelBoard(state.deck[state.index]);
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
  if (isTwoPlayerMode()) {
    const [one, two] = state.players;
    const winner = one.score === two.score ? null : one.score > two.score ? one : two;
    setVisualHouse(winner ? winner.house : one.house);
    elements.finalScoreLabel.textContent = one.name;
    elements.finalScore.textContent = String(one.score);
    elements.finalCorrectLabel.textContent = two.name;
    elements.finalCorrect.textContent = String(two.score);
    elements.resultTrophy.dataset.house = winner ? winner.house : one.house;
    elements.resultHouseLabel.textContent = winner ? HOUSE_NAMES[winner.house] : "Geteilter Hauspokal";
    elements.resultText.textContent = !winner
      ? "Der Hauspokal wird geteilt. Das riecht nach Rückrunde."
      : `${winner.name} gewinnt den Hauspokal für ${HOUSE_NAMES[winner.house]}.`;
    showScreen("result");
    return;
  }

  const isRecord = setBestScore(state.score);
  setVisualHouse(state.house);
  elements.finalScoreLabel.textContent = "Punkte";
  elements.finalCorrectLabel.textContent = "Richtig";
  elements.finalScore.textContent = String(state.score);
  elements.finalCorrect.textContent = `${state.correct}/${state.deck.length}`;
  elements.resultTrophy.dataset.house = state.house;
  elements.resultHouseLabel.textContent = HOUSE_NAMES[state.house];
  elements.resultText.textContent = isRecord
    ? "Neuer Bestwert. Diese Runde sitzt."
    : "Runde gespeichert. Noch eine Runde kann den Bestwert knacken.";
  updateHome();
  showScreen("result");
}

elements.modeCards.forEach((card) => {
  card.addEventListener("click", () => selectMode(card.dataset.mode));
});

elements.houseChoices.forEach((choice) => {
  choice.addEventListener("click", () => setPlayerHouse(Number(choice.dataset.player), choice.dataset.house));
});

elements.soloHouseChoices.forEach((choice) => {
  choice.addEventListener("click", () => applyHouse(choice.dataset.soloHouse));
});

elements.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startRound(elements.categorySelect.value, Number(elements.roundLength.value), elements.difficultySelect.value);
});

elements.houseSelect.addEventListener("change", () => {
  applyHouse(elements.houseSelect.value);
});

elements.roundChoices.forEach((button) => {
  button.addEventListener("click", () => {
    elements.roundLength.value = button.dataset.roundLength;
    renderRoundChoices();
  });
});

elements.difficultyChoices.forEach((button) => {
  button.addEventListener("click", () => {
    elements.difficultySelect.value = button.dataset.difficulty;
    renderDifficultyChoices();
  });
});

elements.buzzerOne.addEventListener("click", () => buzz(0));
elements.buzzerTwo.addEventListener("click", () => buzz(1));

elements.nextButton.addEventListener("click", advanceRound);

elements.hintButton.addEventListener("click", () => {
  const current = state.deck[state.index];
  if (state.hintIndex < current.hints.length - 1) {
    state.hintIndex += 1;
    renderMysteryHint();
  }
});

elements.quitButton.addEventListener("click", () => {
  stopBuzzerTimer();
  showScreen("start");
});
elements.playAgainButton.addEventListener("click", () => {
  stopBuzzerTimer();
  showScreen("start");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
      elements.offlineState.innerHTML = '<span class="status-dot"></span>Offline im Browser';
    } catch {
      elements.offlineState.innerHTML = '<span class="status-dot"></span>Offline im Browser';
    }
  });
}

elements.houseSelect.value = state.house;
document.body.dataset.mode = state.mode;
applyHouse(state.house);
renderHouseChoices();
fillCategories();
renderRoundChoices();
renderDifficultyChoices();
updateHome();
