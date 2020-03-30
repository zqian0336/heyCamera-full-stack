
function zoom() {
    var myD = document.getElementById("myDiv");
    var theNav = document.getElementById("the-nav");

    document.getElementById("beforeZoom").style.display = "none";
    document.getElementById("zoomImg").style.display = "block";


    myD.style.backgroundColor = "#1d2129";
    myD.style.margin = "0";
    myD.style.height = "inherit";
    theNav.classList.add("navbar-dark");
    theNav.classList.add("bg-dark");
    theNav.classList.remove("navbar-light");
    theNav.classList.remove("bg-white");
    document.getElementById("the-log").classList.add("changeColor");
    document.getElementById("addP").classList.add("btn-outline-light");
    document.getElementById("addP").classList.remove("btn-outline-dark");

    document.getElementById("the-footer").style.backgroundColor = "#1d2129";
    // document.getElementById("the-footer").style.marginTop = "0";
    // document.getElementsByTagName("html").style.backgroundColor = "black";
    document.getElementById("the-photo").style.height ="700px";




}

function zoomOut() {
    document.getElementById("zoomImg").style.display = "none";
    document.getElementById("beforeZoom").style.display = "flex";
    document.getElementById("myDiv").style.backgroundColor = "white";
    document.getElementById("the-footer").style.backgroundColor = "#f5f5f5";
    var theNav = document.getElementById("the-nav");
    theNav.classList.add("navbar-light");
    theNav.classList.add("bg-white");
    theNav.classList.remove("navbar-dark");
    theNav.classList.remove("bg-dark");
    document.getElementById("the-log").classList.remove("changeColor");
    document.getElementById("addP").classList.remove("btn-outline-light");
    document.getElementById("addP").classList.add("btn-outline-dark");

}


