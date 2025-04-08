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

// SAMPLE question banks. Each key corresponds to a subject section.
// IMPORTANT: You’ll need to add more questions to reach at least 50 per bank.
const questionBanks = {
  // English Literature (2 separate papers)
  "English Literature Paper 1": [
    {
      question: "Who is the author of the non-Shakespeare text in Paper 1?",
      choices: ["Author A", "Author B", "Author C", "Author D"],
      correctIndex: 1,
      explanation: "Author B is known for their work on the non-Shakespeare text."
    },
    {
      question: "What theme is common in the texts of Paper 1?",
      choices: ["Love", "War", "Betrayal", "Courage"],
      correctIndex: 2,
      explanation: "Betrayal is a key theme in this text."
    }
    // ...add more questions to have at least 50
  ],
  "English Literature Paper 2": [
    {
      question: "Which Shakespeare play is studied in Paper 2?",
      choices: ["Hamlet", "Macbeth", "Othello", "King Lear"],
      correctIndex: 0,
      explanation: "Hamlet is the Shakespeare play examined in Paper 2."
    },
    {
      question: "In addition to Shakespeare, which anthology is covered?",
      choices: ["Modern Poetry", "Classic Poetry", "Romantic Poetry", "Poetry Anthology"],
      correctIndex: 3,
      explanation: "The Poetry Anthology is part of Paper 2."
    }
    // ... add more questions
  ],
  // English Language
  "English Language Reading": [
    {
      question: "What is the primary focus of the reading paper?",
      choices: ["Grammar", "Comprehension", "Creative writing", "Essay structure"],
      correctIndex: 1,
      explanation: "The reading paper focuses on comprehension skills."
    },
    {
      question: "Which technique is crucial for answering inference questions?",
      choices: ["Skimming", "Detailed analysis", "Guessing", "Memorization"],
      correctIndex: 1,
      explanation: "Detailed analysis is crucial for inference questions."
    }
    // ... add more questions
  ],
  "English Language Writing": [
    {
      question: "What element is essential for effective writing?",
      choices: ["Structure", "Vocabulary", "Spelling", "Punctuation"],
      correctIndex: 0,
      explanation: "A clear structure is essential for effective writing."
    },
    {
      question: "Which of the following improves clarity in writing?",
      choices: ["Long sentences", "Complex words", "Concise language", "Ambiguity"],
      correctIndex: 2,
      explanation: "Using concise language improves clarity."
    }
    // ... add more questions
  ],
  // Maths (6 sections)
  "Maths - Numbers & Algebra": [
    {
      question: "What is 12 + 15?",
      choices: ["27", "25", "30", "22"],
      correctIndex: 0,
      explanation: "12 + 15 equals 27."
    },
    // ... add more questions
  ],
  "Maths - Equations, Formulae & Identities": [
    {
      question: "Solve for x: 2x + 4 = 10",
      choices: ["x = 3", "x = 4", "x = 5", "x = 6"],
      correctIndex: 1,
      explanation: "2(4) + 4 equals 12 (check your work!)" // Adjust explanation accordingly.
    },
    // ... add more questions
  ],
  "Maths - Sequences, Functions & Graphs": [
    {
      question: "What is the next number in the sequence: 2, 4, 8, 16, ?",
      choices: ["20", "24", "32", "30"],
      correctIndex: 2,
      explanation: "The sequence doubles, so the next number is 32."
    },
    // ... add more questions
  ],
  "Maths - Geometry & Trigonometry": [
    {
      question: "What is the sum of angles in a triangle?",
      choices: ["180°", "90°", "360°", "270°"],
      correctIndex: 0,
      explanation: "The sum of the angles in a triangle is 180°."
    },
    // ... add more questions
  ],
  "Maths - Vectors & Transformations": [
    {
      question: "Which operation best describes a vector addition?",
      choices: ["Subtraction", "Multiplication", "Addition", "Division"],
      correctIndex: 2,
      explanation: "Vector addition is performed by adding corresponding components."
    },
    // ... add more questions
  ],
  "Maths - Statistics & Probability": [
    {
      question: "What is the probability of a fair coin landing heads up?",
      choices: ["25%", "50%", "75%", "100%"],
      correctIndex: 1,
      explanation: "A fair coin has a 50% chance to land heads up."
    },
    // ... add more questions
  ],
  // Sciences – Physics (8 sections)
  "Science - Physics - Forces & Motion": [
    {
      question: "What is Newton's Second Law?",
      choices: [
        "F = ma",
        "E = mc²",
        "V = IR",
        "P = IV"
      ],
      correctIndex: 0,
      explanation: "Newton’s Second Law states force equals mass times acceleration."
    },
    // ... add more questions
  ],
  "Science - Physics - Electricity": [
    {
      question: "What is the unit of electric current?",
      choices: ["Volt", "Watt", "Ampere", "Ohm"],
      correctIndex: 2,
      explanation: "The unit of electric current is the Ampere."
    },
    // ... add more questions
  ],
  "Science - Physics - Waves": [
    {
      question: "What property defines the wave’s speed?",
      choices: ["Wavelength", "Frequency", "Amplitude", "Period"],
      correctIndex: 1,
      explanation: "Wave speed is defined by wavelength multiplied by frequency."
    },
    // ... add more questions
  ],
  "Science - Physics - Energy Resources & Energy Transfers": [
    {
      question: "What is the principle of conservation of energy?",
      choices: [
        "Energy cannot be created or destroyed",
        "Energy is always lost",
        "Energy decreases over time",
        "Energy is relative"
      ],
      correctIndex: 0,
      explanation: "Energy cannot be created or destroyed – only transformed."
    },
    // ... add more questions
  ],
  "Science - Physics - Solids, Liquids & Gases": [
    {
      question: "Which state of matter has a definite shape?",
      choices: ["Liquid", "Solid", "Gas", "Plasma"],
      correctIndex: 1,
      explanation: "Solids have a definite shape and volume."
    },
    // ... add more questions
  ],
  "Science - Physics - Magnetism & Electromagnetism": [
    {
      question: "What creates a magnetic field?",
      choices: [
        "Static electricity",
        "Movement of electric charges",
        "Light",
        "Sound waves"
      ],
      correctIndex: 1,
      explanation: "Moving electric charges create a magnetic field."
    },
    // ... add more questions
  ],
  "Science - Physics - Radioactivity & Particles": [
    {
      question: "What type of radiation is emitted in alpha decay?",
      choices: ["Alpha particles", "Beta particles", "Gamma rays", "Neutrons"],
      correctIndex: 0,
      explanation: "Alpha decay emits alpha particles."
    },
    // ... add more questions
  ],
  "Science - Physics - Astrophysics": [
    {
      question: "What is the primary component of stars?",
      choices: ["Helium", "Hydrogen", "Carbon", "Iron"],
      correctIndex: 1,
      explanation: "Stars are primarily made of hydrogen."
    },
    // ... add more questions
  ],
  // Sciences – Chemistry (4 sections)
  "Science - Chemistry - Principles of Chemistry": [
    {
      question: "What is an atom?",
      choices: [
        "A small molecule",
        "The basic unit of matter",
        "A chemical reaction",
        "A compound"
      ],
      correctIndex: 1,
      explanation: "An atom is the basic unit of matter."
    },
    // ... add more questions
  ],
  "Science - Chemistry - Inorganic Chemistry": [
    {
      question: "Which element is commonly used in fertilizers?",
      choices: ["Sodium", "Phosphorus", "Gold", "Neon"],
      correctIndex: 1,
      explanation: "Phosphorus is widely used in fertilizers."
    },
    // ... add more questions
  ],
  "Science - Chemistry - Physical Chemistry": [
    {
      question: "What does endothermic mean?",
      choices: [
        "Releases heat",
        "Absorbs heat",
        "No temperature change",
        "Creates electricity"
      ],
      correctIndex: 1,
      explanation: "Endothermic reactions absorb heat."
    },
    // ... add more questions
  ],
  "Science - Chemistry - Organic Chemistry": [
    {
      question: "Which element is a primary component of organic compounds?",
      choices: ["Oxygen", "Nitrogen", "Carbon", "Hydrogen"],
      correctIndex: 2,
      explanation: "Carbon is the backbone of organic compounds."
    },
    // ... add more questions
  ],
  // Sciences – Biology (5 sections)
  "Science - Biology - Nature & Variety of Organisms": [
    {
      question: "What is taxonomy?",
      choices: [
        "The study of cells",
        "Classification of organisms",
        "Plant biology",
        "Evolutionary history"
      ],
      correctIndex: 1,
      explanation: "Taxonomy is the classification of organisms."
    },
    // ... add more questions
  ],
  "Science - Biology - Structure & Function in Organisms": [
    {
      question: "What is the function of the cell membrane?",
      choices: [
        "DNA replication",
        "Energy production",
        "Controls entry and exit of substances",
        "Protein synthesis"
      ],
      correctIndex: 2,
      explanation: "The cell membrane controls what enters and exits the cell."
    },
    // ... add more questions
  ],
  "Science - Biology - Reproduction & Inheritance": [
    {
      question: "Which process creates genetic diversity?",
      choices: ["Mitosis", "Meiosis", "Binary fission", "Budding"],
      correctIndex: 1,
      explanation: "Meiosis creates genetic diversity."
    },
    // ... add more questions
  ],
  "Science - Biology - Ecology & Environment": [
    {
      question: "What is an ecosystem?",
      choices: [
        "A type of organism",
        "A community and its environment",
        "A natural disaster",
        "A food chain"
      ],
      correctIndex: 1,
      explanation: "An ecosystem is a community of living organisms in an environment."
    },
    // ... add more questions
  ],
  "Science - Biology - Use of Biological Resources": [
    {
      question: "What does biotechnology involve?",
      choices: [
        "Software development",
        "Genetic manipulation of organisms",
        "Chemical manufacturing",
        "Astronomical research"
      ],
      correctIndex: 1,
      explanation: "Biotechnology involves the use of living systems and organisms to develop products."
    },
    // ... add more questions
  ],
  // Geography (2 papers)
  "Geography - Physical Geography": [
    {
      question: "What is a common cause of erosion?",
      choices: [
        "Wind",
        "Gravity",
        "Photosynthesis",
        "Ecosystems"
      ],
      correctIndex: 0,
      explanation: "Wind can cause significant erosion in certain areas."
    },
    // ... add more questions
  ],
  "Geography - Human Geography": [
    {
      question: "What factor greatly influences human settlement patterns?",
      choices: [
        "Climate",
        "Soil type",
        "Lunar cycles",
        "Tides"
      ],
      correctIndex: 0,
      explanation: "Climate is a major factor influencing human settlements."
    },
    // ... add more questions
  ]
};

// List of subject cards and their chips (subject sections)
// The keys below must match exactly with the keys in questionBanks.
const subjects = {
  "Maths": {
    colorClass: "maths",
    chips: [
      "Maths - Numbers & Algebra",
      "Maths - Equations, Formulae & Identities",
      "Maths - Sequences, Functions & Graphs",
      "Maths - Geometry & Trigonometry",
      "Maths - Vectors & Transformations",
      "Maths - Statistics & Probability"
    ]
  },
  "Sciences": {
    colorClass: "sciences",
    chips: [
      "Science - Physics - Forces & Motion",
      "Science - Physics - Electricity",
      "Science - Physics - Waves",
      "Science - Physics - Energy Resources & Energy Transfers",
      "Science - Physics - Solids, Liquids & Gases",
      "Science - Physics - Magnetism & Electromagnetism",
      "Science - Physics - Radioactivity & Particles",
      "Science - Physics - Astrophysics",
      "Science - Chemistry - Principles of Chemistry",
      "Science - Chemistry - Inorganic Chemistry",
      "Science - Chemistry - Physical Chemistry",
      "Science - Chemistry - Organic Chemistry",
      "Science - Biology - Nature & Variety of Organisms",
      "Science - Biology - Structure & Function in Organisms",
      "Science - Biology - Reproduction & Inheritance",
      "Science - Biology - Ecology & Environment",
      "Science - Biology - Use of Biological Resources"
    ]
  },
  "English": {
    colorClass: "english",
    chips: [
      "English Literature Paper 1",
      "English Literature Paper 2",
      "English Language Reading",
      "English Language Writing"
    ]
  },
  "Geography": {
    colorClass: "geography",
    chips: [
      "Geography - Physical Geography",
      "Geography - Human Geography"
    ]
  }
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

/* ===== UTILITY FUNCTIONS ===== */

// Randomly select 10 questions (or all available if fewer)
function getRandomQuestions(bank) {
  const shuffled = bank.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
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

// Login handling
document.getElementById("login-btn").addEventListener("click", () => {
  const userPassword = document.getElementById("password").value;
  if (userPassword === CORRECT_PASSWORD) {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
    generateSubjectCards();
  } else {
    document.getElementById("login-error").textContent = "Incorrect password. Please try again.";
  }
});

/* ===== MAIN MENU GENERATION ===== */

function generateSubjectCards() {
  const cardsContainer = document.getElementById("cards-container");
  cardsContainer.innerHTML = "";
  // Loop through each subject in the subjects object
  Object.keys(subjects).forEach(subjectName => {
    const subjectData = subjects[subjectName];
    const card = document.createElement("div");
    card.classList.add("subject-card", subjectData.colorClass);
    
    const title = document.createElement("h3");
    title.textContent = subjectName;
    card.appendChild(title);
    
    // Create chips for each section/paper within this subject
    subjectData.chips.forEach(chipName => {
      const chip = document.createElement("div");
      chip.classList.add("chip");

      const chipTitle = document.createElement("div");
      chipTitle.classList.add("chip-title");
      chipTitle.textContent = chipName;
      chip.appendChild(chipTitle);

      // Create container for buttons
      const btnContainer = document.createElement("div");
      btnContainer.classList.add("chip-buttons");

      // Quiz Button
      const quizBtn = document.createElement("button");
      quizBtn.textContent = "Quiz";
      quizBtn.setAttribute("aria-label", "Launch Quiz for " + chipName);
      quizBtn.addEventListener("click", () => launchQuiz(chipName));
      btnContainer.appendChild(quizBtn);

      // Info Button
      const infoBtn = document.createElement("button");
      infoBtn.textContent = "Info";
      infoBtn.setAttribute("aria-label", "Show Performance Info for " + chipName);
      infoBtn.addEventListener("click", () => openInfoModal(chipName));
      btnContainer.appendChild(infoBtn);

      chip.appendChild(btnContainer);
      card.appendChild(chip);
    });

    cardsContainer.appendChild(card);
  });
}

/* ===== QUIZ LOGIC ===== */

// Launch a quiz for a given subject section
function launchQuiz(sectionName) {
  currentSection = sectionName;
  const bank = questionBanks[sectionName];
  if (!bank || bank.length === 0) {
    alert("No questions available for this section.");
    return;
  }
  currentQuestions = getRandomQuestions(bank);
  currentQuestionIndex = 0;
  score = 0;
  timeLeft = 120;
  firstAttempt = true;
  // Hide main menu and show quiz modal
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("quiz-modal").classList.remove("hidden");
  // Start the timer
  startTimer();
  // Display the first question
  displayQuestion();
}

// Timer function
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
      // Time's up – clear timer and finish quiz
      clearInterval(timerInterval);
      sounds.timeout.play();
      finishQuiz(true);
    }
  }, 1000);
}

// Display current question and reset feedback and choices.
function displayQuestion() {
  // Clear previous feedback
  document.getElementById("feedback").innerHTML = "";
  document.getElementById("next-btn").classList.add("hidden");

  // Get the current question
  if (currentQuestionIndex >= currentQuestions.length) {
    finishQuiz(false);
    return;
  }
  firstAttempt = true;
  const currentQ = currentQuestions[currentQuestionIndex];
  document.getElementById("question-text").textContent = currentQ.question;

  // Build choices buttons list
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

// Evaluate answer selected by user.
function evaluateAnswer(selectedIndex, btn) {
  const currentQ = currentQuestions[currentQuestionIndex];
  // Disable only the clicked button until another attempt is made.
  // We want to allow re-selection if the answer is wrong.
  if (selectedIndex === currentQ.correctIndex) {
    // Correct answer
    if (firstAttempt) {
      score++;
    }
    // Play correct sound and display a green checkmark (using placeholder SVG reference)
    sounds.correct.play();
    document.getElementById("feedback").innerHTML = `<img src="icons/correct.svg" alt="Correct" /> ${currentQ.explanation}`;
    // Show 'Next' button (or 'Complete' if last question)
    const nextBtn = document.getElementById("next-btn");
    nextBtn.textContent = (currentQuestionIndex === currentQuestions.length - 1) ? "Complete" : "Next";
    nextBtn.classList.remove("hidden");
    // Disable all choice buttons to prevent further clicks on this question.
    disableChoices();
  } else {
    // Wrong answer: play wrong sound and show a red X (placeholder SVG)
    sounds.wrong.play();
    document.getElementById("feedback").innerHTML = `<img src="icons/wrong.svg" alt="Incorrect" />`;
    firstAttempt = false; // subsequent attempts won’t count points.
    // Allow the student to try again on the same question.
    // (We do not disable all buttons so that they can try other options.)
  }
}

// Helper to disable all choice buttons for the current question.
function disableChoices() {
  const buttons = document.querySelectorAll("#choices-list button");
  buttons.forEach(button => button.disabled = true);
}

// Next question handler
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
});

// Exit quiz and return to main menu.
document.getElementById("exit-btn").addEventListener("click", () => {
  // Reset quiz modal for next time
  document.getElementById("quiz-modal").classList.add("hidden");
  document.getElementById("quiz-body").classList.remove("hidden");
  document.getElementById("results").classList.add("hidden");
  document.getElementById("main-menu").classList.remove("hidden");
});

/* ===== INFO MODAL (Performance Analytics) ===== */

function openInfoModal(sectionName) {
  // Prepare modal title
  document.getElementById("info-title").textContent = sectionName;
  // Retrieve progress data from localStorage for this section
  const progress = JSON.parse(localStorage.getItem("quizProgress")) || {};
  const sectionData = progress[sectionName] || [];
  
  // If less than 2 data points, show a message instead of a graph.
  if (sectionData.length < 2) {
    document.getElementById("progress-chart").classList.add("hidden");
    document.getElementById("no-data-msg").classList.remove("hidden");
    document.getElementById("metrics").innerHTML = "";
  } else {
    document.getElementById("progress-chart").classList.remove("hidden");
    document.getElementById("no-data-msg").classList.add("hidden");
    // Prepare data for chart.
    const labels = sectionData.map((_, i) => `Attempt ${i + 1}`);
    const scores = sectionData.map(entry => entry.score);
    const timedOutMarkers = sectionData.map(entry => entry.timedOut);

    // Calculate metrics.
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    const lastScore = scores[scores.length - 1];

    document.getElementById("metrics").innerHTML = `
      <p>Average score: ${avgScore} / 10</p>
      <p>Last score: ${lastScore} / 10</p>
    `;

    // Render the chart using Chart.js.
    const ctx = document.getElementById("progress-chart").getContext('2d');
    // If a previous chart exists, destroy it (you might want to store a reference globally)
    if (window.progressChart) {
      window.progressChart.destroy();
    }
    window.progressChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Score',
          data: scores,
          fill: false,
          tension: 0, // straight lines
          borderColor: 'green',
          pointBackgroundColor: scores.map((score, i) => timedOutMarkers[i] ? 'red' : 'blue'),
          pointStyle: scores.map((score, i) => timedOutMarkers[i] ? 'triangle' : 'circle')
        }]
      },
      options: {
        scales: {
          y: {
            min: 0,
            max: 10,
            title: { display: true, text: 'Score / 10' }
          }
        }
      }
    });
  }
  // Show info modal.
  document.getElementById("info-modal").classList.remove("hidden");
}

// Close Info Modal.
document.getElementById("info-close-btn").addEventListener("click", () => {
  document.getElementById("info-modal").classList.add("hidden");
});
