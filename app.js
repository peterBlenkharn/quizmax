/* ===== GLOBAL VARIABLES & DATA STRUCTURES ===== */

// Hard-coded password for client-side access protection.
const CORRECT_PASSWORD = "quiz2025";

// Placeholder sound file paths – replace with your actual files in your repository.
const sounds = {
  correct: new Audio('sounds/correct.mp3'),
  wrong: new Audio('sounds/wrong.mp3'),
  finish: new Audio('sounds/finish.mp3'),
  timeout: new Audio('sounds/timeout.mp3')
};

// Global state variables for quiz session
let currentSection = "";
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 120; // seconds

// Variables for tracking if the current question has been answered correctly on first try
let firstAttempt = true;

// Global variable to store subjects loaded from JSON.
let subjects = {};

/* ===== UTILITY FUNCTIONS ===== */

// Randomly select 10 questions (or all available if fewer)
function getRandomQuestions(bank) {
  const shuffled = bank.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
}

/* ===== ASYNCHRONOUS DATA LOADING ===== */

// Load the subjects definition from an external JSON file
async function loadSubjects() {
  try {
    const response = await fetch('data/subjects.json');
    subjects = await response.json();
    generateSubjectCards(); // Now generate cards using the loaded subjects
  } catch (error) {
    console.error('Error loading subjects:', error);
  }
}

// Save quiz result to localStorage
function saveQuizResult(section, score, timedOut) {
  const progress = JSON.parse(localStorage.getItem("quizProgress")) || {};
  if (!progress[section]) progress[section] = [];
  progress[section].push({
    score, // score out of 10
    timedOut, // Boolean: was the quiz ended by timeout?
    timestamp: new Date().toISOString()
  });
  localStorage.setItem("quizProgress", JSON.stringify(progress));
}

/* ===== INITIAL SETUP & EVENT LISTENERS ===== */

// Login handling event listener
document.getElementById("login-btn").addEventListener("click", () => {
  const userPassword = document.getElementById("password").value;
  if (userPassword === CORRECT_PASSWORD) {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
    // Load subjects from JSON before generating subject cards.
    loadSubjects();
  } else {
    document.getElementById("login-error").textContent = "Incorrect password. Please try again.";
  }
});

/* ===== MAIN MENU GENERATION ===== */

/* ===== GENERATE SUBJECT CARDS WITH ACCORDION FUNCTIONALITY ===== */
// Generate subject cards using the loaded subjects object from JSON
function generateSubjectCards() {
  const cardsContainer = document.getElementById("cards-container");
  cardsContainer.innerHTML = "";
  
  // Iterate over each subject in the subjects object
  Object.keys(subjects).forEach(subjectName => {
    const subjectData = subjects[subjectName];
    const card = document.createElement("div");
    card.classList.add("subject-card", subjectData.colorClass);
    
    // Create a header with the subject name and a toggle icon for accordion behavior
    const header = document.createElement("div");
    header.classList.add("card-header");
    header.innerHTML = `<span>${subjectName}</span><span class="toggle-icon">&#9660;</span>`;
    // Toggle expand/collapse on header click
    header.addEventListener("click", () => {
      card.classList.toggle("expanded");
    });
    card.appendChild(header);
    
    // Create a container for the chips (sections)
    const chipsContainer = document.createElement("div");
    chipsContainer.classList.add("chips-container");
    
    subjectData.chips.forEach(chipName => {
      const chip = document.createElement("div");
      chip.classList.add("chip");

      const chipTitle = document.createElement("div");
      chipTitle.classList.add("chip-title");
      chipTitle.textContent = chipName;
      chip.appendChild(chipTitle);

      const btnContainer = document.createElement("div");
      btnContainer.classList.add("chip-buttons");

      // Quiz Button using an icon image; pass both chipName and subjectName.
      const quizBtn = document.createElement("img");
      quizBtn.src = "icons/startquiz.svg";
      quizBtn.alt = "Start Quiz";
      quizBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent toggle on chip click
        launchQuiz(chipName, subjectName);
      });
      btnContainer.appendChild(quizBtn);

      // Info Button using an icon image; similarly, pass chipName and subjectName if needed.
      const infoBtn = document.createElement("img");
      infoBtn.src = "icons/quizinfo.svg";
      infoBtn.alt = "Quiz Info";
      infoBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openInfoModal(chipName);
      });
      btnContainer.appendChild(infoBtn);

      chip.appendChild(btnContainer);
      chipsContainer.appendChild(chip);
    });
    
    card.appendChild(chipsContainer);
    cardsContainer.appendChild(card);
  });
}

/* ===== QUIZ LOGIC ===== */

// Launch a quiz for a given chip/section, given its chipName and the parent subject folder (subjectName)
// This function is now asynchronous to allow fetching the question bank JSON.
async function launchQuiz(chipName, subjectName) {
  // Build the filename by transforming the chipName using our helper.
  const fileName = chipNameToFileName(chipName);
  // Construct the path according to your folder structure.
  const path = `data/${subjectName}/${fileName}.json`;
  
  try {
    const response = await fetch(path);
    const bank = await response.json();
    // Check if sufficient questions exist
    if (!bank || bank.length < 10) {
      sounds.wrong.play();
      showErrorModal("Not enough questions to generate this quiz.");
      return;
    }
    currentSection = chipName;
    currentQuestions = getRandomQuestions(bank);
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 120;
    firstAttempt = true;
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("quiz-modal").classList.remove("hidden");
    startTimer();
    displayQuestion();
  } catch (error) {
    console.error("Error loading questions for", chipName, ":", error);
    showErrorModal("Error loading questions. Please try again later.");
  }
}


/* ===== SHOW ERROR MODAL (Not Enough Questions) ===== */
function showErrorModal(message) {
  // Reuse the info modal structure to show errors
  document.getElementById("info-title").textContent = "Error";
  document.getElementById("no-data-msg").classList.add("hidden");
  document.getElementById("metrics").innerHTML = `<p>${message}</p>`;
  document.getElementById("progress-chart").classList.add("hidden");
  document.getElementById("info-modal").classList.remove("hidden");
  // Hide the modal automatically after 3 seconds
  setTimeout(() => {
    document.getElementById("info-modal").classList.add("hidden");
  }, 3000);
}

/* ===== TIMER & DISPLAY LOGIC ===== */

// Timer function remains unchanged
function startTimer() {
  const timerEl = document.getElementById("timer");
  timerEl.textContent = `Time: ${timeLeft}s`;
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 10) {
      timerEl.classList.add("timer-warning");
    }
    timerEl.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      sounds.timeout.play();
      finishQuiz(true);
    }
  }, 1000);
}


// Display current question and rebuild answer choices
function displayQuestion() {
  document.getElementById("feedback").innerHTML = "";
  document.getElementById("next-btn").classList.add("hidden");

  if (currentQuestionIndex >= currentQuestions.length) {
    finishQuiz(false);
    return;
  }
  firstAttempt = true;
  const currentQ = currentQuestions[currentQuestionIndex];
  document.getElementById("question-text").textContent = currentQ.question;

  const choicesList = document.getElementById("choices-list");
  choicesList.innerHTML = "";
  currentQ.choices.forEach((choice, index) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.setAttribute("aria-label", "Answer choice: " + choice);
    btn.addEventListener("click", () => evaluateAnswer(index, btn));
    li.appendChild(btn);
    choicesList.appendChild(li);
  });
}

// Evaluate the selected answer and show feedback
function evaluateAnswer(selectedIndex, btn) {
  const currentQ = currentQuestions[currentQuestionIndex];
  if (selectedIndex === currentQ.correctIndex) {
    if (firstAttempt) score++;
    sounds.correct.play();
    showFeedbackOverlay("correct", currentQ.explanation);
    const nextBtn = document.getElementById("next-btn");
    nextBtn.textContent = (currentQuestionIndex === currentQuestions.length - 1) ? "Complete" : "Next";
    nextBtn.classList.remove("hidden");
    disableChoices();
  } else {
    sounds.wrong.play();
    showFeedbackOverlay("incorrect", "");
    firstAttempt = false;
  }
}

// Show an overlay for correct or incorrect answers
function showFeedbackOverlay(type, message) {
  const overlay = document.getElementById("feedback-overlay");
  const icon = (type === "correct")
    ? `<img src="icons/correct.svg" alt="Correct" class="feedback-correct">`
    : `<img src="icons/wrong.svg" alt="Incorrect" class="feedback-incorrect">`;
  overlay.innerHTML = icon + (message ? `<p>${message}</p>` : "");
  overlay.classList.remove("hidden");
  setTimeout(() => {
    overlay.classList.add("hidden");
  }, 1500);
}

// Disable all answer choice buttons for the current question
function disableChoices() {
  const buttons = document.querySelectorAll("#choices-list button");
  buttons.forEach(button => button.disabled = true);
}

// Handle the Next Question button click
document.getElementById("next-btn").addEventListener("click", () => {
  currentQuestionIndex++;
  displayQuestion();
});

// End the quiz – parameter timedOut indicates if quiz ended because of timer.
function finishQuiz(timedOut) {
  clearInterval(timerInterval);
  // Hide quiz body and show results.
  document.getElementById("quiz-body").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
  document.getElementById("final-score").textContent = `Your score: ${score} / ${currentQuestions.length}`;
  sounds.finish.play();
  // Save progress in localStorage
  saveQuizResult(currentSection, score, timedOut);
};

// Exit quiz and return to main menu.
document.getElementById("exit-btn").addEventListener("click", () => {
  // Reset quiz modal for next time
  document.getElementById("quiz-modal").classList.add("hidden");
  document.getElementById("quiz-body").classList.remove("hidden");
  document.getElementById("results").classList.add("hidden");
  document.getElementById("main-menu").classList.remove("hidden");
});


/* ===== INFO MODAL WITH REGRESSION LINE & SCORE TREND ===== */
function openInfoModal(sectionName) {
  // Fetch only the progress for the given section
  document.getElementById("info-title").textContent = sectionName;
  const progress = JSON.parse(localStorage.getItem("quizProgress")) || {};
  const sectionData = progress[sectionName] || [];
  
  if (sectionData.length < 2) {
    document.getElementById("progress-chart").classList.add("hidden");
    document.getElementById("no-data-msg").classList.remove("hidden");
    document.getElementById("metrics").innerHTML = "";
  } else {
    document.getElementById("progress-chart").classList.remove("hidden");
    document.getElementById("no-data-msg").classList.add("hidden");
    const labels = sectionData.map((_, i) => (i + 1).toString());
    const scores = sectionData.map(entry => entry.score);
    // Calculate regression (best fit line)
    const regression = computeRegression(scores);
    // Calculate metrics and trend symbol:
    let trendSymbol = "";
    if (sectionData.length >= 2) {
      const last = sectionData[sectionData.length - 1].score;
      const prev = sectionData[sectionData.length - 2].score;
      if (last > prev) {
        trendSymbol = `<span style="color: green; font-weight: bold;"> +</span>`;
      } else if (last < prev) {
        trendSymbol = `<span style="color: red; font-weight: bold;"> -</span>`;
      } else {
        trendSymbol = `<span style="color: grey; font-weight: bold;"> =</span>`;
      }
    }
    document.getElementById("metrics").innerHTML = `
      <p>Average score: ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)} / 10</p>
      <p>Last score: ${scores[scores.length - 1]} / 10${trendSymbol}</p>
    `;
    // Render the chart:
    const ctx = document.getElementById("progress-chart").getContext('2d');
    if (window.progressChart) window.progressChart.destroy();
    window.progressChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Score',
            data: scores,
            fill: false,
            tension: 0,
            borderColor: getSubjectColor(sectionName),
            pointBackgroundColor: getSubjectColor(sectionName)
          },
          {
            // Best fit regression line dataset (in grey)
            label: 'Trend',
            data: regression, // array of regression values
            fill: false,
            tension: 0,
            borderColor: 'grey',
            borderDash: [5, 5],
            pointRadius: 0
          }
        ]
      },
      options: {
        scales: {
          x: {
            title: { display: true, text: 'attempts' }
          },
          y: {
            min: 0,
            max: 10,
            title: { display: true, text: 'Score / 10' }
          }
        }
      }
    });
  }
  document.getElementById("info-modal").classList.remove("hidden");
}

// Compute simple linear regression for an array of y values
function computeRegression(yValues) {
  const n = yValues.length;
  const xValues = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;
  let numerator = 0, denominator = 0;
  xValues.forEach((x, i) => {
    numerator += (x - meanX) * (yValues[i] - meanY);
    denominator += (x - meanX) ** 2;
  });
  const slope = denominator ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;
  // Generate regression values for each x in xValues
  return xValues.map(x => Math.round((slope * x + intercept) * 100) / 100);
}

function chipNameToFileName(chipName) {
  // Replace "&" with "And", remove punctuation, remove spaces, and convert to lower case.
  return chipName
            .replace(/&/g, "And")
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, "")
            .toLowerCase();
}




// Helper to return the subject color based on section name
function getSubjectColor(sectionName) {
  // You can adjust this mapping based on your subjects/colors.
  // For simplicity, here we use the color from the corresponding subject card.
  for (const subject in subjects) {
    if (subjects[subject].chips.includes(sectionName)) {
      const tempDiv = document.createElement('div');
      tempDiv.classList.add(subjects[subject].colorClass);
      document.body.appendChild(tempDiv);
      const style = window.getComputedStyle(tempDiv);
      const borderColor = style.borderTopColor;
      document.body.removeChild(tempDiv);
      return borderColor;
    }
  }
  return 'black';
}

// Close Info Modal.
document.getElementById("info-close-btn").addEventListener("click", () => {
  document.getElementById("info-modal").classList.add("hidden");
});
