document.addEventListener('DOMContentLoaded', () => {
    const agree1 = document.getElementById('agree1');
    const agree2 = document.getElementById('agree2');
    const startBtn = document.getElementById('start-btn');
    const toggleTheme = document.getElementById('toggle-theme');
    const body = document.body;
  
    function updateButtonState() {
      startBtn.disabled = !(agree1.checked && agree2.checked);
    }
  
    agree1.addEventListener('change', updateButtonState);
    agree2.addEventListener('change', updateButtonState);
  
    startBtn.addEventListener('click', () => {
      window.location.href = 'main.html';
    });
  
    toggleTheme.addEventListener('click', () => {
      body.classList.toggle('dark');
      toggleTheme.textContent = body.classList.contains('dark') ? '☀️ 라이트 모드' : '🌙 다크 모드';
    });
  });
  