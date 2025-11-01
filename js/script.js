const API_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATE_URL = "https://words.dev-apis.com/validate-word"

async function init() {
  const squares = document.querySelectorAll(".square");
  const loader = document.querySelector(".loader");
  let currentSquareIndex = 0;
  let currentRow = 0;
  let isGameOver = false;

  loader.hidden = false;

  const promise = await fetch(API_URL);
  const processedPromise = await promise.json();
  const wordOfDay = processedPromise.word.toUpperCase();

  loader.hidden = true;

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
    return wordValidate.validWord;
  }

  document.addEventListener("keydown", async (event) => {
    // Se o jogo acabou, não faça nada
    if (isGameOver) {
      return;
    }

    const action = event.key;

    if (action === "Backspace" && currentSquareIndex > currentRow * 5) {
      // Lógica do Backspace
      currentSquareIndex--;
      squares[currentSquareIndex].textContent = "";
      squares[currentSquareIndex].classList.remove("square-wrong");
    } else if (isLetter(action) && currentSquareIndex < (currentRow + 1) * 5) {
      squares[currentSquareIndex].textContent = action.toUpperCase();
      currentSquareIndex++;
    } else if (action === "Enter") {
      if (currentSquareIndex < (currentRow + 1) * 5) {
        return;
      }

      // 2. Montar o palpite (guess)
      let guess = '';
      const startIndex = currentRow * 5;
      for (let i = startIndex; i < startIndex + 5; i++) {
        guess += squares[i].textContent;
      }
      guess = guess.toUpperCase(); // Garante que está em maiúsculo

      // 3. Validar a palavra
      const isValidWord = await validateWord(guess);

      if (!isValidWord) {
        for (let i = startIndex; i < startIndex + 5; i++) {
          squares[i].classList.add("square-wrong");
        }
        return;
      }

      for (let i = startIndex; i < startIndex + 5; i++) {
        squares[i].classList.remove("square-wrong");
      }

      const letterCount = {};
      for (let j = 0; j < 5; j++) {
        const letter = wordOfDay[j];
        letterCount[letter] = (letterCount[letter] || 0) + 1;
      }

      const guessLetters = guess.split('');
      const marks = Array(5).fill("");
      for (let j = 0; j < 5; j++) {
        if (guessLetters[j] === wordOfDay[j]) {
          marks[j] = "green";
          letterCount[guessLetters[j]]--;
          squares[startIndex + j].classList.add("square-right");
        }
      }

      for (let j = 0; j < 5; j++) {
        if (marks[j] === "") {
          const letter = guessLetters[j];
          if (letterCount[letter] > 0) {
            marks[j] = "yellow";
            letterCount[letter]--;
            squares[startIndex + j].classList.add("square-contains");
          }
        }
      }

      if (guess === wordOfDay) {
        alert("You win");
        document.querySelector("h1").classList.add("rainbow");
        startConfetti(); 
        isGameOver = true; 
        return;
      }

      currentRow++;

      if (currentRow === 6) {
        alert("Você perdeu a palavra do dia é " + wordOfDay);
        isGameOver = true; 
        return;
      }
    }
  });

  function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }
}

init();
