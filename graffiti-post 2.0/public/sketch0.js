const startBtn = document.querySelector('.start-btn');
const gifContainer = document.getElementById('gif-container');
// const homeBtn = document.getElementById('home-btn');

gifContainer.style.display = 'none';

startBtn.addEventListener('click', () => {
  // window.location.href = 'pageA.html';
  startBtn.style.display = 'none';
  gifContainer.style.display = 'block';
  setTimeout(() => {
    window.location.href = 'pageA.html';
  }, 3000);

});

// homeBtn.addEventListener('click', () => {
//   console.log("homebutton clicked")
//     window.location.href = 'page0.html';

// });

