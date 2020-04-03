var body = document.querySelector("body");
var createNoteBtn = document.querySelector(".create-note");

var bodyActive = true;
var activeBody;
var cursorPos = 0;
var activeList;

var comId = 1;

createNoteBtn.addEventListener("click", function(){
    body.innerHTML += "<div class='note-background'></div>";
    body.innerHTML += "<div class='new-note'>" +
        "<input type='text' class='note-title' placeholder='Title'>" +
        "<span class='note-body' id='com"+(comId)+"' contenteditable='true'></span>" +
        "</div>";
    body.innerHTML += "<div class='note-top-bar'></div>";
    body.innerHTML += "<div class='note-left-bar'>" +
        "<button type='button' class='note-bullet-list-btn'>BL</button>" +
        "<button type='button' class='note-checkbox-list-btn'>CL</button>" +
        "</div>";

    var newNote = document.querySelector(".new-note");
    var bulletBtn = document.querySelector(".note-bullet-list-btn");
    var checkboxBtn = document.querySelector(".note-checkbox-list-btn");

    activeBody = document.querySelectorAll(".note-body")[0];
    TrackCursorPosition();

    bulletBtn.addEventListener('click', function(){
        if (bodyActive){
            var bodyId = activeBody.id;
            var bodyIdNum = parseInt(bodyId.substring(3));
            var component = document.querySelector(("#com" + (bodyIdNum+1)));
            console.log(component);
            if (component) {
                component.querySelector("li").focus();
                activeList = component;
                bodyActive = false;
            }
            else {
                CreateList();
            }
        } else {
            var listId = activeList.id;
            var listIdNum = parseInt(listId.substring(3));
            var noteBody = document.querySelector(("#com" + (listIdNum+1)));
            noteBody.focus();
            activeBody = noteBody;

            TrackCursorPosition();
        }
    })
})

function CreateList(){
    var firstString = activeBody.textContent.substring(0, cursorPos);
    var lastString = activeBody.textContent.substring(cursorPos);

    if (activeBody.textContent.length == (cursorPos+1)) {
        firstString = activeBody.textContent;
        lastString = "";
    }

    activeBody.outerHTML = "<span class='note-body' id='com"+(comId)+"' contenteditable='true'>" + firstString + "</span>" +
        "<ul class='bullet-list-area' id='com"+(comId+1)+"'>" +
        "<li class='bullet-list-item' contenteditable='true'></li></ul>" +
        "<span class='note-body' id='com"+(comId+2)+"' contenteditable='true'>" + lastString + "</span>";

    comId+=2;
    var bulletListItems = document.querySelectorAll(".bullet-list-item");
    bulletListItems[bulletListItems.length - 1].focus();
    SetupBulletListItems();
}

function TrackCursorPosition(){
    var noteBodies = document.querySelectorAll(".note-body");
    bodyActive = true;

    noteBodies.forEach(function(body){
        body.addEventListener("click", function(){
            bodyActive = true;
            activeBody = body;
            cursorPos = document.getSelection().baseOffset;
        })

        body.addEventListener("keydown", function(){
            cursorPos = document.getSelection().baseOffset;
        })
    })
}

function SetupBulletListItems(){
    var items = document.querySelectorAll(".bullet-list-item");
    bodyActive = false;

    for (let i = 0; i < items.length; i++){
        items[i].addEventListener("click", function(){
            bodyActive = false;
            activeList = items[i].parentElement;
        })
        items[i].addEventListener('keyup', function(event){
            if (event.key === "Enter"){
                items[i].querySelector("div").outerHTML = "";
                items[i].outerHTML += "<li class='bullet-list-item' contenteditable='true'></li>";

                items = document.querySelectorAll(".bullet-list-item");
                items[i+1].focus();
                activeList = items[i+1].parentElement;
                SetupBulletListItems();
            }
        })
    }
}