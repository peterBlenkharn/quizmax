/* ===== GLOBAL VARIABLES & STATE ===== */

// Hard-coded password for client-side access protection.
const CORRECT_PASSWORD = "quiz2025";

// Placeholder sound file paths – update with your actual paths.
const sounds = {
  correct: new Audio('sounds/correct.mp3'),
  wrong: new Audio('sounds/wrong.mp3'),
  finish: new Audio('sounds/finish.mp3'),
  timeout: new Audio('sounds/timeout.mp3')
};

// Global state variables for the quiz session.
let currentSection = "";
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

let timerInterval = null;
let totalTime = 180; //seconds
let timeLeft = 180; // seconds

const perlinScale = 0.0005;

let firstAttempt = true; // tracks if the current question is answered correctly on the first try

// Global variable to store subjects loaded from JSON.
let subjects = {};

/* ===== UTILITY FUNCTIONS ===== */

function getRandomQuestions(bank) {
  const shuffled = bank.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
}

function saveQuizResult(section, score, timedOut) {
  const progress = JSON.parse(localStorage.getItem("quizProgress")) || {};
  if (!progress[section]) progress[section] = [];
  progress[section].push({
    score,
    timedOut,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem("quizProgress", JSON.stringify(progress));
}

/* ===== ASYNCHRONOUS DATA LOADING ===== */

async function loadSubjects() {
  try {
    const response = await fetch('data/subjects.json');
    subjects = await response.json();
    generateSubjectCards(); // Generate cards using the loaded subjects.
  } catch (error) {
    console.error('Error loading subjects:', error);
  }
}

/* ===== INITIAL SETUP & EVENT LISTENERS ===== */

document.getElementById("login-btn").addEventListener("click", () => {
  const userPassword = document.getElementById("password").value;
  if (userPassword === CORRECT_PASSWORD) {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("main-header").classList.remove("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
    loadSubjects();
  } else {
    document.getElementById("login-error").textContent = "Incorrect password. Please try again.";
  }
});

/* ===== MAIN MENU GENERATION ===== */

function generateSubjectCards() {
  const cardsContainer = document.getElementById("cards-container");
  cardsContainer.innerHTML = "";
  
  Object.keys(subjects).forEach(subjectName => {
    const subjectData = subjects[subjectName];
    const card = document.createElement("div");
    // Apply subject color class; styling in CSS will use a solid background with gradient.
    card.classList.add("subject-card", subjectData.colorClass);
    
    // Create subject icon image
    const subjectIcon = document.createElement("img");
    // Instead of directly setting the src, we set a data-src attribute:
    subjectIcon.setAttribute("data-src", `icons/${subjectName.replace(/\s/g, "")}.svg`);
    subjectIcon.alt = subjectName + " Icon";
    // Add the dynamic-svg class so our injection function will replace it with inline SVG.
    subjectIcon.classList.add("subject-icon", "dynamic-svg");
    card.appendChild(subjectIcon);
    
    // Subject title
    const title = document.createElement("h3");
    title.textContent = subjectName;
    title.classList.add("subject-title");
    card.appendChild(title);
    
    // Explore button to open the subject modal
    const expandBtn = document.createElement("button");
    expandBtn.textContent = "Explore";
    expandBtn.classList.add("expand-btn");
    expandBtn.addEventListener("click", () => {
      openSubjectModal(subjectName);
    });
    card.appendChild(expandBtn);
    
    cardsContainer.appendChild(card);
  });
  
  // Once cards are generated, inject inline SVGs
  injectSVGs();
}

// This function will replace each <img class="dynamic-svg"> with its inline SVG markup.
function injectSVGs() {
  const svgImages = document.querySelectorAll('img.dynamic-svg');
  svgImages.forEach(img => {
    const src = img.getAttribute('data-src');
    fetch(src)
      .then(response => response.text())
      .then(svgText => {
        const container = document.createElement('div');
        container.innerHTML = svgText.trim();
        const svgElement = container.querySelector('svg');
        if (svgElement) {
          // Remove hardcoded dimensions so that CSS can control sizing.
          svgElement.removeAttribute("width");
          svgElement.removeAttribute("height");
          // Copy classes from the <img> to the <svg>.
          svgElement.classList.add(...img.classList);
          // Optionally, set an aria-label if needed.
          const altText = img.getAttribute('alt');
          if (altText) {
            svgElement.setAttribute('aria-label', altText);
          }
          img.parentNode.replaceChild(svgElement, img);
        }
      })
      .catch(error => {
        console.error("SVG injection error:", error);
      });
  });
}



/* ===== SUBJECT MODAL ===== */

function openSubjectModal(subjectName) {
  const subjectData = subjects[subjectName];
  const modal = document.getElementById("subject-modal");
  
  // Clear previous modal content.
  const modalBody = modal.querySelector(".modal-body");
  modalBody.innerHTML = "";
  
  // Get the header element and set its text.
  const modalHeader = modal.querySelector(".modal-header h3");
  modalHeader.textContent = subjectName;
  // Remove any previously set subject color classes.
  modalHeader.className = "";
  // Add a generic header class plus the subject-specific color class.
  modalHeader.classList.add("modal-subject-header", subjectData.colorClass);
  
  // Create a grid container for chips.
  const grid = document.createElement("div");
  grid.classList.add("chips-grid");
  
  subjectData.chips.forEach(chipName => {
    const chip = document.createElement("div");
    chip.classList.add("chip-modal");
    
    const chipTitle = document.createElement("div");
    chipTitle.classList.add("chip-modal-title");
    chipTitle.textContent = chipName;
    chip.appendChild(chipTitle);
    
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("chip-buttons");
    
    // Quiz button in modal.
    const quizBtn = document.createElement("img");
    quizBtn.src = "icons/startquiz.svg";
    quizBtn.alt = "Start Quiz";
    quizBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeSubjectModal();
      launchQuiz(chipName, subjectName);
    });
    btnContainer.appendChild(quizBtn);
    
    // Info button in modal.
    const infoBtn = document.createElement("img");
    infoBtn.src = "icons/quizinfo.svg";
    infoBtn.alt = "Quiz Info";
    infoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeSubjectModal();
      openInfoModal(chipName);
    });
    btnContainer.appendChild(infoBtn);
    
    chip.appendChild(btnContainer);
    grid.appendChild(chip);
  });
  
  modalBody.appendChild(grid);
  modal.classList.remove("hidden");
}


function closeSubjectModal() {
  document.getElementById("subject-modal").classList.add("hidden");
}

// Close subject modal when the modal's close button is clicked.
document.getElementById("subject-modal-close").addEventListener("click", closeSubjectModal);


/* ===== QUIZ LOGIC ===== */

// Launch quiz (modified to load external JSON).
async function launchQuiz(chipName, subjectName) {
  const fileName = chipNameToFileName(chipName);
  // Construct the path (subject folder names: ensure they match exactly your folder structure)
  const path = `data/${subjectName}/${fileName}.json`;
  
  try {
    const response = await fetch(path);
    const bank = await response.json();
    if (!bank || bank.length < 10) {
      sounds.wrong.play();
      showErrorModal("Not enough questions to generate this quiz.");
      return;
    }
    currentSection = chipName;
    currentQuestions = getRandomQuestions(bank);
    currentQuestionIndex = 0;
    score = 0;
    firstAttempt = true;

    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("quiz-modal").classList.remove("hidden");
    document.getElementById("main-header").classList.add("hidden");

    updateQuizHeader(subjectName, chipName);
    
    updateProgressBarColors(subjectName);
    // Update background colors based on the subject
    startNoiseBackground(subjectName);
    // Activate the quiz mode background animation.
    document.body.classList.add("quiz-active");

    
    startTimer();
    displayQuestion();
  } catch (error) {
    console.error("Error loading questions for", chipName, ":", error);
    showErrorModal("Error loading questions. Please try again later.");
  }
}


function showErrorModal(message) {
  document.getElementById("info-title").textContent = "Error";
  document.getElementById("no-data-msg").classList.add("hidden");
  document.getElementById("metrics").innerHTML = `<p>${message}</p>`;
  document.getElementById("progress-chart").classList.add("hidden");
  document.getElementById("info-modal").classList.remove("hidden");
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
    updateProgressBar();  // Update progress bar each tick
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      sounds.timeout.play();
      finishQuiz(true);
    }
  }, 1000);
}

function updateProgressBar() {
  const elapsedTime = totalTime - timeLeft;
  const percent = (elapsedTime / totalTime) * 100;
  document.getElementById("time-progress").style.width = percent + '%';
}

function updateProgressBarColors(subjectName) {
  // Example: if you already store the colors in your subjects object,
  // you can retrieve them like so:
  const subjectData = subjects[subjectName];
  // For example, assume subjectData.colorClass is "maths", and your .maths rule sets:
  // --subject-color: #07a0c3; and --subject-color-dark: #0492b0;
  // To get these values dynamically, you could:
  const tempDiv = document.createElement('div');
  tempDiv.classList.add(subjectData.colorClass);
  document.body.appendChild(tempDiv);
  const style = window.getComputedStyle(tempDiv);
  const primaryColor = style.getPropertyValue('--subject-color').trim();
  const darkColor = style.getPropertyValue('--subject-color-dark').trim();
  document.body.removeChild(tempDiv);

  const progressBar = document.getElementById("time-progress");
  // Set the background using an inline style:
  progressBar.style.background = `linear-gradient(90deg, ${primaryColor}, ${darkColor})`;
}

function updateBodyBackground(subjectName) {
  const subjectData = subjects[subjectName];
  const tempDiv = document.createElement('div');
  tempDiv.classList.add(subjectData.colorClass);
  document.body.appendChild(tempDiv);
  const style = getComputedStyle(tempDiv);
  // Retrieve the CSS variables from the subject class (make sure they are defined in your CSS)
  const primaryColor = style.getPropertyValue('--subject-color').trim();
  const darkColor = style.getPropertyValue('--subject-color-lite').trim();
  document.body.removeChild(tempDiv);
  
  // Set these as new CSS variables on the body
  document.body.style.setProperty('--quiz-color1', primaryColor);
  document.body.style.setProperty('--quiz-color2', darkColor);
}

function startNoiseBackground(subjectName) {
  // Create (or reuse) a full-screen canvas element for the background.
  let noiseCanvas = document.getElementById('noise-canvas');
  if (!noiseCanvas) {
    noiseCanvas = document.createElement('canvas');
    noiseCanvas.id = 'noise-canvas';
    noiseCanvas.style.position = 'fixed';
    noiseCanvas.style.top = '0';
    noiseCanvas.style.left = '0';
    noiseCanvas.style.width = '100%';
    noiseCanvas.style.height = '100%';
    noiseCanvas.style.zIndex = '-1';
    document.body.appendChild(noiseCanvas);
  }
  
  // Match canvas resolution to window size for full coverage.
  noiseCanvas.width = window.innerWidth;
  noiseCanvas.height = window.innerHeight;
  
  const ctx = noiseCanvas.getContext('2d');

  // Get subject colors using a temporary element.
  const subjectData = subjects[subjectName];
  const tempDiv = document.createElement('div');
  tempDiv.classList.add(subjectData.colorClass);
  document.body.appendChild(tempDiv);
  const computed = getComputedStyle(tempDiv);
  const color1 = computed.getPropertyValue('--subject-color').trim();
  const color2 = computed.getPropertyValue('--subject-color-lite').trim();
  document.body.removeChild(tempDiv);

  // Helper to parse hex color to r, g, b.
  function parseHex(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  }
  
  const col1 = parseHex(color1);
  const col2 = parseHex(color2);

  // Linear interpolation helper.
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  // Blend two colors.
  function blendColors(c1, c2, t) {
    return {
      r: Math.round(lerp(c1.r, c2.r, t)),
      g: Math.round(lerp(c1.g, c2.g, t)),
      b: Math.round(lerp(c1.b, c2.b, t))
    };
  }
  
  function toHex(c) {
    return '#' +
      ('0' + c.r.toString(16)).slice(-2) +
      ('0' + c.g.toString(16)).slice(-2) +
      ('0' + c.b.toString(16)).slice(-2);
  }
  
  let time = 0;
  const scale = perlinScale; // frequency; adjust to taste.

  function renderNoise() {
    // Create an ImageData object for the canvas.
    const imageData = ctx.createImageData(noiseCanvas.width, noiseCanvas.height);
    const data = imageData.data;
    
    // Loop over every pixel.
    for (let y = 0; y < noiseCanvas.height; y++) {
      for (let x = 0; x < noiseCanvas.width; x++) {
        // Sample Perlin noise.
        let noiseValue = Perlin.noise(x * scale, y * scale, time);
        // Map noise from [-1, 1] to [0, 1]
        let t = (noiseValue + 1) / 2;
        // Blend between the two colours.
        const blended = blendColors(col1, col2, t);
        const index = (x + y * noiseCanvas.width) * 4;
        data[index]     = blended.r;
        data[index + 1] = blended.g;
        data[index + 2] = blended.b;
        data[index + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    time += 0.01;  // Adjust for the speed of the animation.
    requestAnimationFrame(renderNoise);
  }
  
  renderNoise();
}

function updateQuizHeader(subjectName, chipName) {
  // Get the quiz header panel elements.
  const headerPanel = document.getElementById("quiz-header-panel");
  const headerIconContainer = headerPanel.querySelector(".header-icon");
  const headerTitle = headerPanel.querySelector(".header-title");
  
  // Get subject colors from the subject's CSS class.
  const subjectData = subjects[subjectName];
  const tempDiv = document.createElement('div');
  tempDiv.classList.add(subjectData.colorClass);
  document.body.appendChild(tempDiv);
  const computedStyle = window.getComputedStyle(tempDiv);
  const primaryColor = computedStyle.getPropertyValue('--subject-color').trim();
  const darkColor = computedStyle.getPropertyValue('--subject-color-dark').trim();
  const liteColor = computedStyle.getPropertyValue('--subject-color-lite').trim();
  document.body.removeChild(tempDiv);
  
  // Set the inline style of the header icon container with a gradient background.
  headerIconContainer.style.background = `linear-gradient(45deg, ${primaryColor}, ${darkColor})`;
  headerIconContainer.style.borderRadius = "12px";
  headerIconContainer.style.display = "flex";
  headerIconContainer.style.alignItems = "center";
  headerIconContainer.style.justifyContent = "center";
  // Set the container's color so that the icon (using currentColor) adopts the dark hue.
  headerIconContainer.style.color = liteColor;
  
  // Update the dynamic SVG of the icon.
  const iconImg = headerIconContainer.querySelector("img.dynamic-svg");
  iconImg.setAttribute("data-src", `icons/${subjectName.replace(/\s/g, "")}.svg`);
  iconImg.setAttribute("alt", subjectName + " Icon");
  
  // Re-inject the SVG so the new icon becomes inline.
  injectSVGs();
  
  // Update the header title to show the chip/section title.
  headerTitle.textContent = chipName;
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
    showFeedbackPanel("correct", currentQ.explanation);
    const nextBtn = document.getElementById("next-btn");
    nextBtn.textContent = (currentQuestionIndex === currentQuestions.length - 1) ? "Complete" : "Next";
    nextBtn.classList.remove("hidden");
    disableChoices();
  } else {
    sounds.wrong.play();
    showFeedbackPanel("incorrect", "");
    firstAttempt = false;
  }
}

// Show an overlay for correct or incorrect answers
function showFeedbackPanel(type, message) {
  const panel = document.getElementById("feedback");
  // Build the icon HTML based on type:
  const icon = (type === "correct")
    ? `<img src="icons/correct.svg" alt="Correct" class="feedback-correct">`
    : `<img src="icons/wrong.svg" alt="Incorrect" class="feedback-incorrect">`;
  
  // Update the panel’s inner HTML
  panel.innerHTML = icon + (message ? `<p>${message}</p>` : "");
  panel.classList.remove("hidden");
  
  // Optionally, automatically hide it after 1.5 seconds.
  setTimeout(() => {
    panel.classList.add("hidden");
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
  console.log("Next button clicked");
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
  // Load the Lottie animation into the results panel.
  loadLottieResultsAnimation();
};

// Exit quiz and return to main menu.
document.getElementById("exit-btn").addEventListener("click", () => {
  // Reset quiz modal for next time
  document.getElementById("quiz-modal").classList.add("hidden");
  document.getElementById("quiz-body").classList.remove("hidden");
  document.getElementById("results").classList.add("hidden");
  document.getElementById("main-menu").classList.remove("hidden");

  // Show the main menu and restore the header
  document.getElementById("main-menu").classList.remove("hidden");
  document.getElementById("main-header").classList.remove("hidden");
  document.body.classList.remove("quiz-active");
  const noiseCanvas = document.getElementById("noise-canvas");
  if(noiseCanvas) {
    noiseCanvas.remove();
  }
});


/* ===== INFO MODAL WITH REGRESSION LINE & SCORE TREND ===== */
function openInfoModal(sectionName) {
  // Destroy any previously rendered chart.
  if (window.progressChart) {
    window.progressChart.destroy();
    window.progressChart = null;
  }

  // Update the title for the info modal.
  document.getElementById("info-title").textContent = sectionName;

  // Get progress data for the section.
  const progress = JSON.parse(localStorage.getItem("quizProgress")) || {};
  const sectionData = progress[sectionName] || [];

  // If there's insufficient data (fewer than 2 quiz attempts),
  // hide the chart and show a message.
  if (sectionData.length < 2) {
    document.getElementById("progress-chart").classList.add("hidden");
    document.getElementById("no-data-msg").classList.remove("hidden");
    document.getElementById("metrics").innerHTML = "<p>Do more quizzes on this topic for cool data</p>";
  } else {
    // With sufficient data, show the chart container.
    document.getElementById("progress-chart").classList.remove("hidden");
    document.getElementById("no-data-msg").classList.add("hidden");
  
    const labels = sectionData.map((_, i) => (i + 1).toString());
    const scores = sectionData.map(entry => entry.score);
  
    // Calculate regression (best fit line).
    const regression = computeRegression(scores);
  
    // Calculate metrics and determine the trend symbol.
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
  
    // Render the chart.
    const ctx = document.getElementById("progress-chart").getContext('2d');
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
            // Regression line dataset
            label: 'Trend',
            data: regression,
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
  // Replace "&" with "And"
  let modified = chipName.replace(/&/g, "And");
  // Remove punctuation (anything not a word character or whitespace)
  modified = modified.replace(/[^\w\s]/g, "");
  // Split into words and filter out any empty strings
  const words = modified.split(/\s+/).filter(word => word.length > 0);
  // Convert words into PascalCase: first letter uppercase, rest lower-case
  const pascalCase = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
  return pascalCase;
}

function loadLottieResultsAnimation() {
  lottie.loadAnimation({
    container: document.getElementById('lottie-results'), // the dom element that will contain the animation
    renderer: 'svg',
    loop: true,     // set to false if you want it to play only once
    autoplay: true,
    path: 'animations/results2.json' // the path to your lottie JSON file in your repo
  });
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
