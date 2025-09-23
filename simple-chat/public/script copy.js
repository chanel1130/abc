let formEle = document.querySelector("#chatForm");
console.log(formEle)
let msgInput = document.querySelector("#newMessage");
console.log(msgInput);
// initialize socket connection
const socket = io();


// LISTEN FOR NEWLY TYPES MESSAGES, 
// SEND THEM TO THE SERVER
formEle.addEventListener("submit", newMessagesSubmitted);

function newMessagesSubmitted(event){
  console.log(event);
  //to print the message and stop form element from refreshing the page
  event.preventDefault();
  let newMsg = msgInput.value;
  console.log(newMsg);

  //actually we need to send the new message to the server first
  appendMessage(newMsg);//just for fun

  socket.emit("message",newMsg);

  //clear out the input in the textbox
  msgInput.value = '';

}


// LISTEN FOR NEW MESSAGES FROM SERVER
// APPEND THEM TO THE MESSAGE BOX
// AUTO SCROLL TO BOTTOM

// APPEND MESSAGES TO BOX
function appendMessage(txt) {
  console.log(txt);
  // select list (ul) first (ul stands for unordered list)
  let chatThreadList = document.querySelector("#threadWrapper ul");
  console.log(chatThreadList);

  // create new list item (li) (li is a single item in the list)
  let newListItem = document.createElement("li")
  newListItem.innerText = txt;

  //append new li to the list
  chatThreadList.append(newListItem);

  //scroll to the buttom
  chatThreadList.scrollTop = chatThreadList.scrollHeight;

}

// appendMessage("yeah");

socket.on("newMessage", function(data){
  console.log(data);
  //messageToAllClients now has two objects, sender and message
  appendMessage(data.message);
});




// OPTIONAL: LISTEN FOR NEW NAME
// SEND IT TO SERVER
