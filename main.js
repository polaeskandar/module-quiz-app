const quizAppContainer = document.querySelector(".quiz-app");
const questionsCountDiv = document.querySelector(".quiz-counters .count");
const bulletsContainer = document.querySelector(".bullets");
const quizInfoContainer = document.querySelector(".quiz-info");
const tagsContainer = document.querySelector(".tags");
const questionContainer = document.querySelector(".question");
const answersContainer = document.querySelector(".answers-area");
const submitBtn = document.querySelector(".submit-button");
const countDownContainer = document.querySelector(".countdown");

let currentQuestionIndex = 0;
let questionsGotRightCount = 0;
let countDownInterval;

const removeLoadingState = () => document.querySelector(".overlay").remove();

const changeQuestionsCount = (questionsCount) =>
  (questionsCountDiv.innerHTML = `${questionsCount} Questions`);

const createBullets = (questionsCount) => {
  for (let i = 0; i < questionsCount; i++) {
    let bulletElement = document.createElement("span");
    bulletsContainer.appendChild(bulletElement);
  }
  bulletsContainer
    .querySelectorAll("span")
    [currentQuestionIndex].classList.add("active");
};

const createTags = (questionObject) => {
  for (const tag of questionObject.tags) {
    let tagSpan = document.createElement("span");
    let tagText = document.createTextNode(tag);
    tagSpan.appendChild(tagText);
    tagsContainer.appendChild(tagSpan);
  }
};

const createQuestion = (questionObject) => {
  const questionHeading = document.createElement("h2");
  if (questionObject.render_title_as_html) {
    questionHeading.innerHTML = questionObject.title;
  } else {
    const questionText = document.createTextNode(questionObject.title);
    questionHeading.appendChild(questionText);
  }
  questionContainer.appendChild(questionHeading);
};

const createAnswers = (questionObject) => {
  for (let i = 1; i <= 4; i++) {
    let answerContainer = document.createElement("div");
    answerContainer.classList.add("answer");
    let answerInput = document.createElement("input");
    answerInput.id = `answer_${i}`;
    answerInput.type = "radio";
    answerInput.name = "answers";
    answerInput.dataset.answer = questionObject[`answer_${i}`];
    answerContainer.appendChild(answerInput);
    let answerLabel = document.createElement("label");
    answerLabel.htmlFor = `answer_${i}`;
    let answerLabelText = document.createTextNode(
      questionObject[`answer_${i}`]
    );
    answerLabel.appendChild(answerLabelText);
    answerContainer.appendChild(answerLabel);
    answersContainer.appendChild(answerContainer);
  }
};

const checkAnswer = (questionObject) => {
  const rightAnswer = questionObject.right_answer;
  const answers = document.getElementsByName("answers");
  let chosenAnswer = null;

  answers.forEach((answer) => {
    if (answer.checked) chosenAnswer = answer;
  });

  if (chosenAnswer && rightAnswer === chosenAnswer.dataset.answer) {
    questionsGotRightCount++;
  }

  currentQuestionIndex++;
};

const removeQuestion = () => {
  bulletsContainer.innerHTML = "";
  tagsContainer.innerHTML = "";
  questionContainer.innerHTML = "";
  answersContainer.innerHTML = "";
};

const moreQuestions = (questionsCount) =>
  questionsCount - 1 !== currentQuestionIndex;

const showResults = (questionsCount) => {
  bulletsContainer.remove();
  quizInfoContainer.remove();
  questionContainer.remove();
  answersContainer.remove();
  submitBtn.remove();

  let resultsDiv;

  if (
    questionsGotRightCount >= questionsCount / 1.125 &&
    questionsGotRightCount <= questionsCount
  ) {
    resultsDiv = `<div class="results">
       <span class="grade excellent">Excellent</span>
       <span class="message">You got ${questionsGotRightCount} right out of ${questionsCount}</span>
     </div>`;
  } else if (questionsGotRightCount >= questionsCount / 1.5) {
    resultsDiv = `<div class="results">
       <span class="grade good">Good</span>
       <span class="message">You got ${questionsGotRightCount} right out of ${questionsCount}</span>
     </div>`;
  } else if (questionsGotRightCount >= questionsCount / 2) {
    resultsDiv = `<div class="results">
       <span class="grade accepted">Accepted</span>
       <span class="message">You got ${questionsGotRightCount} right out of ${questionsCount}</span>
     </div>`;
  } else {
    resultsDiv = `<div class="results">
       <span class="grade bad">Bad</span>
       <span class="message">You got ${questionsGotRightCount} right out of ${questionsCount}</span>
     </div>`;
  }

  quizAppContainer.innerHTML = resultsDiv;
};

const startCountDown = (duration) => {
  if (moreQuestions()) {
    let minutes, seconds;
    countDownInterval = setInterval(() => {
      (minutes = parseInt(duration / 60)), (seconds = parseInt(duration % 60));
      countDownContainer.innerHTML = `${minutes < 10 ? "0" : ""}${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
      if (--duration < 0) {
        clearInterval(countDownInterval);
        submitBtn.click();
      }
    }, 1000);
  }
};

const getQuestions = () => {
  let request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let questionsObject = JSON.parse(this.responseText);
      let questionsCount = questionsObject.length;

      startCountDown(5);
      changeQuestionsCount(questionsCount);
      createBullets(questionsCount);
      createTags(questionsObject[currentQuestionIndex]);
      createQuestion(questionsObject[currentQuestionIndex]);
      createAnswers(questionsObject[currentQuestionIndex]);
      removeLoadingState();

      submitBtn.onclick = () => {
        if (moreQuestions(questionsCount)) {
          checkAnswer(questionsObject[currentQuestionIndex]);
          removeQuestion();
          createBullets(questionsCount);
          createTags(questionsObject[currentQuestionIndex]);
          createQuestion(questionsObject[currentQuestionIndex]);
          createAnswers(questionsObject[currentQuestionIndex]);
          clearInterval(countDownInterval);
          startCountDown(5);
        } else {
          checkAnswer(questionsObject[currentQuestionIndex]);
          removeQuestion();
          showResults(questionsCount);
        }
      };
    }
  };
  request.open("GET", "questions/set_01.json", true);
  request.send();
};

getQuestions();
