var monthlyTasks = document.querySelector(".monthly-tasks");
function disableClick(list){
    list.clickAvailable = false;
    setTimeout(function(){
        list.clickAvailable = true;
    }, 100)
}
function disableBackspace(list){
    list.backspaceAvailable = false;
    setTimeout(function(){
        list.backspaceAvailable = true;
    }, 100)
}
function disableEnter(list){
    list.enterAvailable = false;
    setTimeout(function(){
        list.enterAvailable = true;
    }, 100)
}
function disableTab(list){
    list.tabAvailable = false;
    setTimeout(function(){
        list.tabAvailable = true;
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
    cursorPos: 0,
    getItems: function(){
        var items = document.querySelectorAll(".task-item");
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
        return '<span class="task-item" contenteditable="true" data-position="' + index.toString() + '"></span>';
    }
}

// Set initial listeners for items
setListListeners(listDetails);
// Prevent default tab and enter key functionality
document.onkeydown = function(e){
    if(e.key === "Tab"){
        return false;
    }
    else if (e.key === "Enter"){
        return false;
    }
}


function setListListeners(list){
    var items = list.getItems();

    for (let i = 0; i < items.length; i++){
        items[i].removeEventListener("click", function(){});
        items[i].addEventListener("click", function(){
            if (list.clickAvailable == false) return;
            var pos = document.activeElement.getAttribute("data-position");
            list.setActiveItem(parseInt(pos));
            disableClick(list);
        })
        items[i].addEventListener("keyup", function(e){
            if (e.key === "Tab"){
                if (list.activeIndex != i || !list.tabAvailable) return; // Prevents duplicate event trigger
                list.setToNextItem();
                disableTab(list);
            }
            else if (e.key === "Enter"){
                if (list.activeIndex != i || !list.enterAvailable) return; // Prevents duplicate event trigger
                list.listItems[list.activeIndex].outerHTML +=
                    list.getListItemHTML(i);
                setListListeners(list);
                list.setActiveItem(i + 1);
                disableEnter(list);
            }
            else if (e.key === "Backspace" && list.cursorPos == 0){
                if (list.activeIndex != i || list.backspaceAvailable == false) return; // Prevents duplicate event trigger
                list.listItems[list.activeIndex].outerHTML = "";
                setListListeners(list);
                list.setToPreviousItem();
                disableBackspace(list);
                list.saveRequired = true;
            }
            else {
                list.cursorPos = document.getSelection().baseOffset;
                list.saveRequired = true;
            }
        })
    }
}

monthlyTasks.addEventListener("blur", function(){
    console.log("blur");
    console.log("save required: " + listDetails.saveRequired);
    if (listDetails.saveRequired){
        updateMonth();
    }
}, true)


function updateMonth(){
    listDetails.saveRequired = false;

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
