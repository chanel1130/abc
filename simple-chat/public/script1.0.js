let formEle = document.querySelector("#chatForm");
console.log(formEle)
let msgInput = document.querySelector("#newMessage");
console.log(msgInput);
let nameInput = document.querySelector("#nameWrapper input");
// initialize socket connection
const socket = io();


// LISTEN FOR NEWLY TYPES MESSAGES, 
// SEND MESSAGES TO THE SERVER
formEle.addEventListener("submit", newMessagesSubmitted);

function newMessagesSubmitted(event) {
  //to print the message and stop form element from refreshing the page
  event.preventDefault();
  let newMsg = msgInput.value.trim();
  let sender = nameInput.value.trim() || "anonymous"; // 默认名

  //actually we need to send the new message to the server first
  // appendMessage(newMsg);//just for fun

  if (newMsg) {
    socket.emit("message", {
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
  words.forEach(word => {
    let span = document.createElement("span");
    span.classList.add("word");
    span.innerText = word;

    // spacing between words
    span.style.display = "inline-block";
    span.style.marginRight = "6px";

    let growInterval;
    let fontSize = 16;
    let maxSize = 80;
    let minSize = 16;
    let reachMax = false;

    function startGrow(e) {
      e.preventDefault();
      //get the ul for auto scroll
      const chatThreadList = document.querySelector("#threadWrapper ul");
      //set a timer for growing the text
      growInterval = setInterval(() => {

        if (fontSize >= minSize) {


          if (!reachMax) {
            fontSize += 2;
            if (fontSize >= maxSize) {
              fontSize = maxSize;
              reachMax = true;
            }
          } else {
            fontSize -= 2;
            if (fontSize <= minSize) {
              reachMax = false;
              fontSize = minSize;
              clearInterval(growInterval);
            }
          }

        }

        span.style.fontSize = fontSize + "px";

        //continue scrolling to the bottom while growing the text
        chatThreadList.scrollTop = chatThreadList.scrollHeight;
      }, 150);

    }

    function stopGrow() {
      clearInterval(growInterval);
    }

    //element.addEventListener(eventType, callback, options);
    span.addEventListener("mousedown", startGrow);
    span.addEventListener("mouseup", stopGrow);
    //{ passive: false } prevents the browser from scroll when touching
    span.addEventListener("touchstart", startGrow, { passive: false });
    span.addEventListener("touchend", stopGrow);
    wordsWrapper.appendChild(span);
  });

  newListItem.appendChild(wordsWrapper);
  chatThreadList.appendChild(newListItem);
  //auto scroll to the bottom
  chatThreadList.scrollTop = chatThreadList.scrollHeight;
}

// RECEIVE MESSAGES FROM THE SERVER
socket.on("newMessage", function (data) {
  console.log(data);
  //messageToAllClients now has two objects, sender and message
  appendMessage(data);
});


// OPTIONAL: LISTEN FOR NEW NAME
// SEND IT TO SERVER


