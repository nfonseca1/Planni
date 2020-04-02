var body = document.querySelector("body");
var createNoteBtn = document.querySelector(".create-note");

var bodyActive = true;

createNoteBtn.addEventListener("click", function(){
    body.innerHTML += "<div class='note-background'></div>";
    body.innerHTML += "<div class='new-note'>" +
        "<input type='text' class='note-title' placeholder='Title'>" +
        "<span class='note-body' contenteditable='true'></span>" +
        "</div>";
    body.innerHTML += "<div class='note-top-bar'></div>";
    body.innerHTML += "<div class='note-left-bar'>" +
        "<button type='button' class='note-bullet-list-btn'>BL</button>" +
        "<button type='button' class='note-checkbox-list-btn'>CL</button>" +
        "</div>";

    var newNote = document.querySelector(".new-note");
    var bulletBtn = document.querySelector(".note-bullet-list-btn");
    var checkboxBtn = document.querySelector(".note-checkbox-list-btn");

    bulletBtn.addEventListener('click', function(){
        if (bodyActive){
            newNote.innerHTML += "<ul class='bullet-list-area'>" +
                "<li class='bullet-list-item' contenteditable='true'></li></ul>";

            var bulletListItems = document.querySelectorAll(".bullet-list-item");
            bulletListItems[bulletListItems.length - 1].focus();
            bodyActive = false;
            SetupBulletListItems();
        } else {
            newNote.innerHTML += "<span class='note-body' contenteditable='true'></span>"

            var noteBodies = document.querySelectorAll(".note-body");
            noteBodies[noteBodies.length - 1].focus();
            bodyActive = true;

            noteBodies.forEach(function(body){
                body.addEventListener("click", function(){
                    bodyActive = true;
                })
            })
        }
    })
})

function SetupBulletListItems(){
    var items = document.querySelectorAll(".bullet-list-item");

    items.forEach(function(item){
        item.addEventListener("click", function(){
            bodyActive = false;
        })
    });

    for (let i = 0; i < items.length; i++){
        items[i].addEventListener('keyup', function(event){
            if (event.key === "Enter"){
                items[i].querySelector("div").outerHTML = "";
                items[i].outerHTML += "<li class='bullet-list-item' contenteditable='true'></li>";

                items = document.querySelectorAll(".bullet-list-item");
                items[i+1].focus();
                SetupBulletListItems();
            }
        })
    }
}