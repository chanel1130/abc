const startBtn = document.querySelector('.start-btn');
const gifContainer = document.getElementById('gif-container');
// const homeBtn = document.getElementById('home-btn');



if (location.hostname.toLowerCase().startsWith('browsercircus') || location.hostname.toLowerCase().startsWith('www')) {
  socket = io({ path: "/chanel/port-4200/socket.io" });  // yields '/leon/port-4100/socket.io' or '/socket.io'
} else {
  socket = io();
}

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

