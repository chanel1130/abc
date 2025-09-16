

// window.addEventListener("deviceorientation", handleOrientation, true); // can be deleted later


function handleOrientation(eventData){
    console.log(eventData);

    document.querySelector('#alpha').innerText = "alpha: " + Math.round(eventData.alpha);
    document.querySelector('#beta').innerText = "beta: " + Math.round(eventData.beta);
    document.querySelector('#gamma').innerText = "gamma: " + Math.round(eventData.gamma);

//the request button disappers after pressing
    document.querySelector('h1').style.display = "none";
    document.querySelector('#requestOrientationButton').style.display = "none";

    document.querySelector('#square').style.transform = "rotate("+eventData.alpha+"deg)";
}







