
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

var dateListDetails = {
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
    cursorPos: 0,
    getItems: function(){
        var items = document.querySelectorAll(".date-item");
        for (let i = 0; i < items.length; i++){
            items[i].setAttribute("data-position", i.toString());
        }
        this.setItems(items);
        return items;
    },
    clickAvailable: true,
    backspaceAvailable: true,
    enterAvailable: true,
    tabAvailable: true,
    saveRequired: false,
    getListItemHTML: function(index){
        return '<span class="date-item" contenteditable="true" data-position="' + index.toString() + '"></span>';
    }
}

// Prevent default tab and enter key functionality
document.onkeydown = function(e){
    if(e.key === "Tab"){
        return false;
    }
    else if (e.key === "Enter"){
        return false;
    }
}

document.querySelector(".back-button").addEventListener("click", function(){
    if (dateListDetails.saveRequired){
        updateDate();
    }
}, true)


function updateDate(){
    dateListDetails.saveRequired = false;

    var id = document.querySelector(".month-name").getAttribute("data-month-uuid");
    var items = document.querySelectorAll(".date-item");
    var reminders = document.querySelectorAll(".date-reminders");
    var itemsArr = [];
    var remindersArr = [];

    items.forEach(function(item){
        var obj = {
            Text: item.textContent,
            Color: item.style.color,
            IsUnderlined: false
        }
        if (obj.Color == "") obj.Color = "black";
        itemsArr.push(obj);
    });
    reminders.forEach(function(reminder){
        var obj = {
            Text: reminder.textContent
        }
        remindersArr.push(obj);
    });

    var data = {
        monthId: id,
        date: selectedCellIndex + 1
    }
    if (itemsArr.length > 0) data.tasks = itemsArr;
    if (remindersArr.length > 0) data.reminders = remindersArr;

    axios.put("/api/dates", {
        data: data
    })
        .then(function(response){
            console.log(response);
        })
}
