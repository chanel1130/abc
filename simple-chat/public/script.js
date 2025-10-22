let formEle = document.querySelector("#chatForm");
console.log(formEle)
let msgInput = document.querySelector("#newMessage");
console.log(msgInput);
let nameInput = document.querySelector("#nameWrapper input");
// initialize socket connection
//const socket = io();
const CUT = 1;
const parts = location.pathname.replace(/\/+$/,'').split('/').filter(Boolean);
const base  = parts.length ? '/' + parts.slice(0, -CUT).join('/') : ''; // on SERVER...
// const base  = parts.length ? parts.slice(0, -CUT).join('/') : ''; // on LOCAL...
console.log(base);

const socket = io({ path: base + '/socket.io' });


// LISTEN FOR NEWLY TYPED MESSAGES, 
// SEND MESSAGES TO THE SERVER
formEle.addEventListener("submit", newMessagesSubmitted);
function newMessagesSubmitted(event) {
  //to print the message and stop form element from refreshing the page
  event.preventDefault();
  //.value: the content in the input
  //.trim() can trim the blank in the string
  let newMsg = msgInput.value.trim();
  let sender = nameInput.value.trim() || "anonymous";

  //actually we need to send the new message to the server first
  if (newMsg) {
    //give each message a unique ID
    const messageID = generateUniqueId();
    socket.emit("message", {
      id: messageID,
      sender: sender,
      message: newMsg
    });
    //clear out the input in the textbox
    msgInput.value = '';
  }
}


// LISTEN FOR NEW MESSAGES FROM SERVER
// APPEND MESSAGES TO THE MESSAGE BOX
// AUTO SCROLL TO BOTTOM
function appendMessage(data) {
  let chatThreadList = document.querySelector("#threadWrapper ul");
  let newListItem = document.createElement("li");
  newListItem.dataset.messageId = data.id; //give each li a unique id


  //add sender's name to the new message
  //"span": add a <span> element
  let whoSpan = document.createElement("span");
  //classList (.add, .remove...): manages class names
  // "who": the class name is who <span class="who">
  whoSpan.classList.add("who");
  //innerText: return the visible text content
  // whoSpan.innerText = data.sender + ": ";
  whoSpan.innerText = data.sender;
  //appendChild: add a new element as the last child of the parent node
  newListItem.appendChild(whoSpan);


  let wordsWrapper = document.createElement("span");
  wordsWrapper.classList.add("words");

  // split the message by word (using the space between each word to split)
  let words = data.message.split(" ");

  // grow the word by mouse / touch
  words.forEach((word, wordIndex) => {
    //give each word a span
    let span = document.createElement("span");
    span.classList.add("word");
    span.innerText = word;

    //write messageID and wordIndex to dataset
    if (data.id) {
      span.dataset.messageId = data.id;
      span.dataset.wordIndex = wordIndex;
    }
    // spacing between words
    span.style.display = "inline-block";
    span.style.marginRight = "6px";

    //element.addEventListener(eventType, callback, options);
    // span.addEventListener("mousedown", startGrow);
    // span.addEventListener("mouseup", stopGrow);
    //{ passive: false } prevents the browser from scroll when touching
    // span.addEventListener("touchstart", startGrow, { passive: false });
    // span.addEventListener("touchend", stopGrow);



    // pass the span so each word grows independently
    span.addEventListener("mousedown", () => startGrow(span));
    span.addEventListener("mouseup", () => stopGrow(span));
    span.addEventListener("touchstart", (e) => { e.preventDefault(); startGrow(span); }, { passive: false });
    span.addEventListener("touchend", () => stopGrow(span));

    //render messages
    wordsWrapper.appendChild(span);

    // li.appendChild(span);
    // ul.appendChild(li);
    // ul.scrollTop = ul.scrollHeight;
  });

  newListItem.appendChild(wordsWrapper);
  chatThreadList.appendChild(newListItem);
  //auto scroll to the bottom
  chatThreadList.scrollTop = chatThreadList.scrollHeight;
};


// set up size limits for growing text
let maxSize = 80;
let minSize = 16;


// start growing the specific word
function startGrow(span) {
  if (span.growInterval) return; // already growing

  //tell server to grow the specific word (send both messageId and wordIndex)
  socket.emit("startGrow", {
    messageId: span.dataset.messageId,
    wordIndex: span.dataset.wordIndex
  });

  //get current font size
  let fontSize = parseInt(window.getComputedStyle(span).fontSize);
  let reachMax = false;

  //set a timer for growing the text
  span.growInterval = setInterval(() => {
    if (!reachMax) {
      fontSize += 2;
      if (fontSize >= maxSize) reachMax = true;
    } else {
      fontSize -= 2;
      if (fontSize <= minSize) {
        fontSize = minSize;
        reachMax = false;
        clearInterval(span.growInterval);
        delete span.growInterval;
      }
    }

    span.style.fontSize = fontSize + "px";
  }, 150);
}


// stop growing the specific word
function stopGrow(span) {
  if (span.growInterval) {
    clearInterval(span.growInterval);
    delete span.growInterval;
    // tell server to stop growing the text (send both messageId and wordIndex)
    socket.emit("stopGrow", { 
      messageId: span.dataset.messageId, 
      wordIndex: span.dataset.wordIndex 
    });
  }
}


// RECEIVE MESSAGES FROM THE SERVER
// here data is info in messageToALlClients
socket.on("newMessage", function (data) {
  console.log(data);
  //messageToAllClients now has two objects, sender and message
  appendMessage(data);
});

// RECEIVE GROW EVENTS FROM SERVER
// only grow/stop the specific word (messageId + wordIndex)
socket.on("startGrow", (data) => {
  const span = document.querySelector(
    `[data-message-id="${data.messageId}"][data-word-index="${data.wordIndex}"]`
  );
  if (span) {
    startGrow(span)
  }
});

socket.on("stopGrow", (data) => {
  const span = document.querySelector(
    `[data-message-id="${data.messageId}"][data-word-index="${data.wordIndex}"]`
  );
  if (span) {
    stopGrow(span)
  }
});

// OPTIONAL: LISTEN FOR NEW NAME
// SEND IT TO SERVER


//generate a unique id for every message
//so that every client can get the growing text animation
//otherwise the server doesn't know which text to grow
//https://stackoverflow.com/questions/8012002/create-a-unique-number-with-javascript-time/70160289?utm_source=chatgpt.com
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
