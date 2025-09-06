document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  header?.classList.remove('opacity-0');
  header?.classList.add('opacity-100');

  const title = document.getElementById('headerTitle');
  if (title) {
    const text = title.textContent.trim();
    title.textContent = '';
    let i = 0;
    const speed = 100;
    function type() {
      if (i < text.length) {
        title.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }
});
