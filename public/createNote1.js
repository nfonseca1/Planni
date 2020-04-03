var body = document.querySelector("body");
var createNoteBtn = document.querySelector(".create-note");

const comType = {
    paragraph: "paragraph",
    list: "list"
};

function SetListKeyListeners() {
    listDetails.activeListItem.addEventListener("keyup", function(event){
        console.log("tickk");
        if (event.key === "Backspace" && listDetails.cursorPos == 0) {
            if (listDetails.SetToPreviousItem()) return;
        }
        else if (event.key === "Enter") {
            if (listDetails.SetToNextItem()) return;
            else {
                listDetails.activeListItem.outerHTML += "<li class='bullet-list-item' " +
                    "contenteditable='true'></li>";
                var items = listDetails.listElement.querySelectorAll("li");
                items[listDetails.listItemIndex].querySelector("div").outerHTML = "";
                listDetails.nextItem = items[items.length - 1];
                if (listDetails.SetToNextItem()) return;
            }
        }
        listDetails.cursorPos = document.getSelection().baseOffset;
    });
}

function SetParagraphKeyListeners() {
    comDetails.activeElement.addEventListener("keyup", function(event){
        if (event.key === "Backspace" && comDetails.cursorPos == 0) {
            if (comDetails.SetToPreviousElement()) return;
        }
        comDetails.cursorPos = document.getSelection().baseOffset;
        console.log(comDetails.cursorPos);
    });
}

var listDetails = {
    SetActiveListItem: function(itemIndex, listElement){
        var items = listElement.querySelectorAll("li");
        this.listElement = listElement;
        this.activeListItem = items[itemIndex];
        this.listItemIndex = itemIndex;
        this.activeListItem.focus();
        // Set next list item
        if ((itemIndex + 1) == items.length) this.nextItem = null;
        else this.nextItem = items[itemIndex + 1];
        // Set previous element
        if (itemIndex == 0) this.previousItem = null;
        else this.previousItem = items[itemIndex - 1];
        // Set listeners
        SetListKeyListeners();
    },
    SetToPreviousItem: function(){
        if (this.previousItem != null) {
            this.SetActiveListItem(this.listItemIndex - 1, this.listElement);
            return true;
        }
        return false;
    },
    SetToNextItem: function(){
        if (this.nextItem != null) {
            this.SetActiveListItem(this.listItemIndex + 1, this.listElement);
            return true;
        }
        return false;
    },
    listElement: null,
    activeListItem: null,
    listItemIndex: 0,
    previousItem: null,
    nextItem: null,
    cursorPos: 0
}

var comDetails = {
    SetActiveElement: function(componentIndex){
        var components = document.querySelectorAll(".note-component");
        this.activeElement = components[componentIndex];
        this.elementIndex = componentIndex;
        // Set next element
        if ((componentIndex + 1) == components.length) this.nextElement = null;
        else this.nextElement = components[componentIndex + 1];
        // Set previous element
        if (componentIndex == 0) this.previousElement = null;
        else this.previousElement = components[componentIndex - 1];
        // Set component type and event listener
        if (this.activeElement.classList.contains("note-paragraph")) {
            this.activeType = comType.paragraph;
            this.activeElement.focus();
            SetParagraphKeyListeners();
        } else {
            this.activeType = comType.list;
            listDetails.SetActiveListItem(0, this.activeElement);
        }
    },
    SetToPreviousElement: function(){
        if (this.previousElement != null) {
            this.SetActiveElement(this.elementIndex - 1);
            return true;
        }
        return false;
    },
    activeType: comType.paragraph,
    activeElement: null,
    elementIndex: 0,
    previousElement: null,
    nextElement: null,
    text: "",
    cursorPos: 0,
};

createNoteBtn.addEventListener("click", function(){
    body.innerHTML += "<div class='note-background'></div>";
    body.innerHTML += "<div class='new-note'>" +
        "<input type='text' class='note-title' placeholder='Title'>" +
        "<span class='note-paragraph note-component' contenteditable='true'></span>" +
        "</div>";
    body.innerHTML += "<div class='note-top-bar'></div>";
    body.innerHTML += "<div class='note-left-bar'>" +
        "<button type='button' class='note-bullet-list-btn'>BL</button>" +
        "<button type='button' class='note-checkbox-list-btn'>CL</button>" +
        "</div>";

    var newNote = document.querySelector(".new-note");
    var bulletBtn = document.querySelector(".note-bullet-list-btn");
    var checkboxBtn = document.querySelector(".note-checkbox-list-btn");

    comDetails.SetActiveElement(0);
    SetParagraphClickListeners();

    bulletBtn.addEventListener('click', function(){
        if (comDetails.activeType == comType.paragraph){
            CreateList();
        } else {
            comDetails.SetActiveElement(comDetails.elementIndex + 1);
            SetParagraphClickListeners();
        }
    })
})

function CreateList(){
    var firstString = comDetails.activeElement.textContent.substring(0, comDetails.cursorPos);
    var lastString = comDetails.activeElement.textContent.substring(comDetails.cursorPos);
    console.log("active: " + comDetails.activeElement.textContent.length + " - cursor: " + comDetails.cursorPos);
    if (comDetails.activeElement.textContent.length == (comDetails.cursorPos + 1)) {
        firstString = comDetails.activeElement.textContent;
        lastString = "";
    }
    console.log(firstString + " " + lastString);
    comDetails.activeElement.outerHTML = "<span class='note-paragraph note-component' contenteditable='true'>" + firstString + "</span>" +
        "<ul class='bullet-list-area note-component'>" +
        "<li class='bullet-list-item' contenteditable='true'></li></ul>" +
        "<span class='note-paragraph note-component' contenteditable='true'>" + lastString + "</span>";

    comDetails.SetActiveElement(comDetails.elementIndex + 1);
    SetListClickListeners();
}

function SetParagraphClickListeners(){
    var noteBodies = document.querySelectorAll(".note-paragraph");

    noteBodies.forEach(function(body){
        body.addEventListener("click", function(){
            comDetails.SetActiveElement();
            comDetails.cursorPos = document.getSelection().baseOffset;
        })
    })
}

function SetListClickListeners(){
    var items = document.querySelectorAll(".bullet-list-item");

    for (let i = 0; i < items.length; i++){
        items[i].addEventListener("click", function(){
            comDetails.SetActiveElement(comDetails.elementIndex + 1);
        })
    }
}