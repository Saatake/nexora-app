const buttons = document.querySelectorAll('.botoes button');
const texto = document.getElementById('texto');
const historyContainer = document.getElementById('historyContainer');

const messages = {
  feliz: "Que bom que você está feliz! 😄",
  triste: "Tudo bem se sentir triste. Respire fundo 😢",
  bravo: "Respire fundo e tente relaxar 😡",
  neutro: "Dia normal, aproveite o momento 😐",
  confiante: "Você está confiante, aproveite essa energia! 😎",
  ansioso: "Tente relaxar e focar no presente 😰",
  desmotivado: "Dia difícil, mas amanhã é outro dia 😔",
  cansado: "Hora de descansar um pouco 😴",
  relaxado: "Que bom que você está relaxado! 🤗"
};

let history = JSON.parse(localStorage.getItem('humorHistory')) || [];

function renderHistory() {
  historyContainer.innerHTML = '';

  const grouped = {};

  history.forEach(entry => {
    if (!grouped[entry.date]) grouped[entry.date] = [];
    grouped[entry.date].push(entry);
  });

  for (let date in grouped) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day-history');

    const dayTitle = document.createElement('h3');
    dayTitle.textContent = date;
    dayDiv.appendChild(dayTitle);

    const ul = document.createElement('ul');

    grouped[date].forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.time} - ${entry.humor}`;
      ul.appendChild(li);
    });

    dayDiv.appendChild(ul);
    historyContainer.appendChild(dayDiv);
  }
}

function addHumor(humor, displayText) {
  const now = new Date();

  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  history.push({ date, time, humor: displayText });

  localStorage.setItem('humorHistory', JSON.stringify(history));

  texto.textContent = messages[humor];

  renderHistory();
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const humor = button.dataset.humor;
    const displayText = button.textContent;

    addHumor(humor, displayText);
  });
});

renderHistory();