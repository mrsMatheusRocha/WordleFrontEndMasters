const API_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATE_URL = "https://words.dev-apis.com/validate-word"
async function init() {
  const squares = document.querySelectorAll(".square");
  const loader = document.querySelector(".loader");
  let currentSquareIndex = 0;
  let currentRow = 0;

  loader.hidden = false;

  const promise = await fetch(API_URL);
  const processedPromise = await promise.json();
  const wordOfDay = processedPromise.word;
  let guess;

  async function validateWord(word) {
    loader.hidden = false;
    const response = await fetch(VALIDATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ word })
    });
    const wordValidate = await response.json();
    loader.hidden = true;
    const isValid = wordValidate.validWord;
    return isValid;
  }

  loader.hidden = true;

  document.addEventListener("keydown", async (event) => {
    const action = event.key;

    if (action === "Backspace" && currentSquareIndex > currentRow * 5) {
      currentSquareIndex--;
      squares[currentSquareIndex].textContent = "";
    } else if (isLetter(action) && currentSquareIndex < (currentRow + 1) * 5) {
      squares[currentSquareIndex].textContent = action.toUpperCase();
      currentSquareIndex++;
    }

    guess = '';
    const startIndex = currentRow * 5;
    for (let i = startIndex; i < startIndex + 5; i++) {
      guess += squares[i].textContent;
    }

    if (currentSquareIndex % 5 === 0 && currentSquareIndex !== 0) {
      if (action === "Enter") {
        for (let i = currentRow * 5; i < (currentRow + 1) * 5; i++) {
          squares[i].classList.remove("square-wrong", "square-right", "square-contains");
        }

        if (guess.toUpperCase() === wordOfDay.toUpperCase()) {
          for (let i = currentRow * 5; i < (currentRow + 1) * 5; i++) {
            squares[i].classList.add("square-right");
          }
          alert("You win");
          document.querySelector("h1").classList.add("rainbow");
          startConfetti();
        }
        if (currentSquareIndex === (currentRow + 1) * 5) {
          if (await validateWord(guess.toUpperCase()) === true) {
            for (let i = currentRow * 5; i < (currentRow + 1) * 5; i++) {
              squares[i].classList.remove("square-wrong", "square-right", "square-contains");
              squares[i].classList.add("square-normal");
            }
            for (let i = currentRow * 5; i < (currentRow + 1) * 5; i++) {
              const letterCount = {};
              for (let j = 0; j < 5; j++) {
                const letter = wordOfDay[j].toUpperCase();
                letterCount[letter] = (letterCount[letter] || 0) + 1;
              }

              const guessLetters = [];
              for (let j = currentRow * 5; j < (currentRow + 1) * 5; j++) {
                guessLetters.push(squares[j].textContent.toUpperCase());
              }

              const marks = Array(5).fill("");

              for (let j = 0; j < 5; j++) {
                if (guessLetters[j] === wordOfDay[j].toUpperCase()) {
                  marks[j] = "green";
                  letterCount[guessLetters[j]]--;
                  squares[currentRow * 5 + j].classList.add("square-right");
                }
              }

              for (let j = 0; j < 5; j++) {
                if (marks[j] === "") {
                  const letter = guessLetters[j];
                  if (letterCount[letter] > 0) {
                    marks[j] = "yellow";
                    letterCount[letter]--;
                    squares[currentRow * 5 + j].classList.add("square-contains");
                  }
                }
              }
            }
            currentRow++;
          } else if (await validateWord(guess.toUpperCase()) === false) {
            for (let i = currentRow * 5; i < (currentRow + 1) * 5; i++) {
              squares[i].classList.remove("square-right", "square-contains");
              squares[i].classList.add("square-wrong");
            }
          }
        }
        if (currentRow >= 6) {
          alert("Você perdeu a palavra do dia é " + wordOfDay);
          return;
        }
      }
    }

  });

  function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }
}

init();
