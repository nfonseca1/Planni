var monthlyTasks = document.querySelector(".monthly-tasks");
var saveRequired = false;
var clickAvailable = true;
var backspaceAvailable = true;
function disableClick(){
    clickAvailable = false
    setInterval(function(){
        clickAvailable = true;
    }, 100)
}
function disableBackspace(){
    backspaceAvailable = false
    setInterval(function(){
        backspaceAvailable = true;
    }, 100)
}

function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    {
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}

var listDetails = {
    setItems: function(items){
        this.listItems = items;
    },
    setActiveItem: function(index){
        this.activeIndex = index;
        this.listItems[index].focus();
        this.cursorPos = document.getSelection().baseOffset;
        if (index >= (this.listItems.length - 1)) this.nextItemIndex = null;
        else this.nextItemIndex = index + 1;
        if (index == 0) this.previousItemIndex = null;
        else {
            this.previousItemIndex = index - 1;
            var pre = this.listItems[this.previousItemIndex];
            pre.innerHTML = pre.textContent;
        }
    },
    setToPreviousItem: function(){
        if (this.previousItemIndex != null) {
            this.setActiveItem(this.previousItemIndex);
            setEndOfContenteditable(document.activeElement);
            this.cursorPos = document.activeElement.textContent.length;
            return true;
        }
        return false;
    },
    setToNextItem: function(){
        if (this.nextItemIndex != null) {
            this.setActiveItem(this.nextItemIndex);
            return true;
        }
        return false;
    },
    listItems: [],
    activeIndex: 0,
    nextItemIndex: null,
    previousItemIndex: null,
    cursorPos: 0
}

// Set initial listeners for items
setListeners();
// Prevent default tab and enter key functionality
document.onkeydown = function(e){
    if(e.key === "Tab"){
        return false;
    }
    else if (e.key === "Enter"){
        return false;
    }
}

function getItems(){
    var items = document.querySelectorAll(".task-item");
    for (let i = 0; i < items.length; i++){
        items[i].setAttribute("data-position", i.toString());
    }
    listDetails.setItems(items);
    return items;
}

function setListeners(){
    var items = getItems();

    for (let i = 0; i < items.length; i++){
        items[i].removeEventListener("click", function(){});
        items[i].addEventListener("click", function(){
            if (clickAvailable == false) return;
            var pos = document.activeElement.getAttribute("data-position");
            listDetails.setActiveItem(parseInt(pos));
            disableClick();
        })
        items[i].addEventListener("keyup", function(e){
            if (e.key === "Tab"){
                if (listDetails.activeIndex != i) return; // Prevents duplicate event trigger
                listDetails.setToNextItem();
            }
            else if (e.key === "Enter"){
                if (listDetails.activeIndex != i) return; // Prevents duplicate event trigger
                listDetails.listItems[listDetails.activeIndex].outerHTML +=
                    '<span class="task-item" contenteditable="true" data-position="' + i.toString() + '"></span>';
                setListeners();
                listDetails.setActiveItem(i + 1);
            }
            else if (e.key === "Backspace" && listDetails.cursorPos == 0){
                if (listDetails.activeIndex != i || backspaceAvailable == false) return; // Prevents duplicate event trigger
                listDetails.listItems[listDetails.activeIndex].outerHTML = "";
                setListeners();
                listDetails.setToPreviousItem();
                disableBackspace();
                saveRequired = true;
            }
            else {
                listDetails.cursorPos = document.getSelection().baseOffset;
                saveRequired = true;
            }
        })
    }
}

monthlyTasks.addEventListener("blur", function(){
    console.log("blur");
    console.log("save required: " + saveRequired);
    if (saveRequired){
        updateMonth();
    }
}, true)


function updateMonth(){
    saveRequired = false;

    var id = document.querySelector(".month-name").getAttribute("data-month-uuid");
    var items = document.querySelectorAll(".task-item");
    var tasks = [];

    items.forEach(function(item){
        tasks.push(item.textContent);
    });

    axios.put("/api/month", {
        data: {
            monthId: id,
            monthlyTasks: tasks
        }
    })
        .then(function(response){
            console.log(response);
        })
}
