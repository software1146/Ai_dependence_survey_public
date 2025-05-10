document.addEventListener("DOMContentLoaded", async () => {
  idontfuckingcare();

  const questions = await getQuestions(); 
  window.questions = questions;

  const questionsTobe = document.getElementById("where-my-fucking-code-will-be-at");

  questions.forEach((question) => {
    const questionElement = document.createElement("div");
    questionElement.classList.add("question");

    const questionTitle = document.createElement("h4");
    questionTitle.textContent = `${question.no}. ${question.text}`;
    questionElement.appendChild(questionTitle);

    const scale = ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"];
    const scaleContainer = document.createElement("div");
    scaleContainer.classList.add("scale-container");

    scale.forEach((label, index) => {
      const labelElement = document.createElement("label");
      labelElement.classList.add("radio-label");

      const inputElement = document.createElement("input");
      inputElement.type = "radio";
      inputElement.name = `question-${question.no}`;
      inputElement.value = index + 1;

      labelElement.appendChild(inputElement);
      labelElement.append(` ${label}`);
      scaleContainer.appendChild(labelElement);
    });

    questionElement.appendChild(scaleContainer);
    questionsTobe.appendChild(questionElement);
    questionElement.appendChild(document.createElement("br"));
  });

  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const name = radio.name;

      document.querySelectorAll(`input[name="${name}"]`).forEach((btn) => {
        const label = btn.closest(".radio-label");
        if (label) label.classList.remove("selected");
      });

      const selectedLabel = radio.closest(".radio-label");
      if (selectedLabel) selectedLabel.classList.add("selected");
    });
  });
});

function idontfuckingcare() {
  const form = document.getElementById("survey-form");
  const birthYearSelect = document.getElementById("birthYear");

  for (let year = 2015; year >= 1950; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = `${year}년`;
    birthYearSelect.appendChild(option);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
  
    const responses = document.querySelectorAll("input[type=radio]:checked");
    const scores = {
      일반: 0,
      인식: 0,
      성향: 0,
      의존도: 0
    };
  
    responses.forEach((input) => {
      const questionNo = parseInt(input.name.replace("question-", ""));
      const question = window.questions.find(q => q.no === questionNo);
      if (question && scores.hasOwnProperty(question.type)) {
        scores[question.type] += parseInt(input.value);
      }
    });
  
    const birthYear = parseInt(birthYearSelect.value);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
  
    const genderInput = document.querySelector("input[name='gender']:checked");
    const gender = genderInput ? genderInput.value : "미선택";
  
    localStorage.setItem("surveyScores", JSON.stringify({
      ...scores,
      나이: age,
      성별: gender
    }));
  
    window.location.href = "submit.html";
  });

  const themeToggleBtn = document.getElementById("toggle-theme");
  themeToggleBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    themeToggleBtn.textContent = document.body.classList.contains("dark-mode")
      ? "☀️ 라이트 모드"
      : "🌙 다크 모드";
  });

  const checkboxLabels = document.querySelectorAll(".checkbox-group label");
  const radioLabels = document.querySelectorAll(".radio-group label");

  checkboxLabels.forEach(label => {
    const input = label.querySelector("input");
    input.addEventListener("change", () => {
      label.classList.toggle("checked", input.checked);
    });
  });

  radioLabels.forEach(label => {
    const input = label.querySelector("input");
    input.addEventListener("change", () => {
      radioLabels.forEach(l => l.classList.remove("checked"));
      label.classList.add("checked");
    });
  });
}

async function getQuestions() {
  const response = await fetch("/questions");
  const data = await response.json();
  return data || [];
}
