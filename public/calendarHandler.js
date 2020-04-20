var notesView = document.querySelector(".notes-view-container");
var calendarCells = document.querySelectorAll(".calendar-cell");
var nextMonthBtn = document.querySelector(".next-month-btn");
var previousMonthBtn = document.querySelector(".previous-month-btn");
var activeCells = [];
var activeCellBodies = [];
var activeCellTasks = [];
var selectedCellIndex;
var check = true;

var monthName = document.querySelector(".month-name");
var date = new Date(); // Today's date
var monthIndex, // Index of month 0 - 11 (January - December)
    firstDayOfMonth, // Index starting from 0 - 6 (Sunday - Saturday)
    lastDateOfMonth, // Last date of month (30, 31 etc.)
    lastDateOfPreviousMonth; // Last date of last month


function createCalendar(){
    determineDateInfo();
    applyDates();
    getMonth();
}

function determineDateInfo() // Determine the first day of month, last date of month and previous month
{
    monthIndex = date.getMonth();

    date.setDate(1);
    firstDayOfMonth = date.getDay();

    var nextMonthIndex = monthIndex + 1;
    if (nextMonthIndex > 11) nextMonthIndex = 0;
    date.setMonth(nextMonthIndex);
    date.setDate(0); // Sets to last date of previous month (This month)
    lastDateOfMonth = date.getDate();

    date.setDate(0); // Sets to last date of previous month
    lastDateOfPreviousMonth = date.getDate();
    date.setMonth(monthIndex); // Set back to this month
}

function applyDates() // Loop through calendar cells and apply date number to appropriate cell
{
    activeCells = [];
    var previousDates = (lastDateOfPreviousMonth - firstDayOfMonth) + 1;
    var currentDates = 1;
    var nextDates = 1;
    for (var i = 0; i < calendarCells.length; i++){
        if (i < firstDayOfMonth) { // Dates in previous month
            calendarCells[i].querySelector(".calendar-cell-info").textContent = previousDates;
            calendarCells[i].classList.add("inactive-cell");
            previousDates++;
        }
        else if (currentDates <= lastDateOfMonth){ // Dates for this month
            calendarCells[i].querySelector(".calendar-cell-info").textContent = currentDates;
            currentDates++;
            activeCells.push(calendarCells[i]);
            activeCellBodies.push(calendarCells[i].querySelector(".date-cell-tasks"));
            activeCellTasks.push([]);
        }
        else { // Dates for next month
            calendarCells[i].querySelector(".calendar-cell-info").textContent = nextDates;
            calendarCells[i].classList.add("inactive-cell");
            nextDates++;
        }
    }
}

function getMonth() // Send api call to get current month info
{
    var tasksArea = document.querySelector(".monthly-tasks");
    tasksArea.innerHTML = "";
    axios.get("/api/month", {
        params: {
            monthIndex: monthIndex,
            year: date.getFullYear()
        }
    })
        .then(function(response){
            monthName.textContent = response.data[0].Month;
            monthName.setAttribute("data-month-uuid", response.data[0].UUID);
            // TODO determine which month filter is default. Set tasks based on that month
            var tasks = response.data[0].MonthlyTasks;
            if (tasks != null && tasks.length > 0){
                for (var i = 0; i < tasks.length; i++){
                    tasksArea.innerHTML += '<span class="task-item" contenteditable="true" data-position="0">' +
                        tasks[i] + '</span>'
                }
                setListListeners(listDetails);
            }
            else {
                tasksArea.innerHTML = '<span class="task-item" contenteditable="true" data-position="0"></span>';
            }

            getDates(response.data[0].UUID);
        })
}

function getDates(monthId){
    axios.get("/api/dates", {
        params: {
            monthId: monthId
        }
    })
        .then(function(response){
            for (let i = 0; i < activeCells.length; i++){
                activeCellBodies[i].innerHTML = "";

                if (response.data.length == 0) continue;
                // Otherwise, loop through each retrieved db date and see if theres a match
                for (let x = 0; x < response.data.length; x++){
                    if (response.data[x].Date == i + 1){ // If there's a match, fill in the date cell data
                        // Fill in date data
                        response.data[x].Tasks.forEach(function(task){
                            activeCellTasks[i].push(task);
                            var underlined = "none";
                            if (task.IsUnderlined) underlined = "underline";
                            var listItem = "<li style='color: " + task.Color + "; text-decoration: " + underlined + ";'>" + task.Text + "</li>";
                            activeCellBodies[i].innerHTML += listItem;
                        })
                        activeCells[i].setAttribute("data-date-uuid", response.data[x].UUID);
                        break;
                    }
                    else if (response.data[x].Date > i){ // If the data's date is greater than what we're looking for, stop
                        break;
                    }
                }
            }
            setDateListeners();
        })
}

function updateDateCell(index){
    activeCellBodies[index].innerHTML = "";
    activeCellTasks[index].forEach(function(task){
        var underlined = "none";
        if (task.IsUnderlined) underlined = "underline";
        var listItem = "<li style='color: " + task.Color + "; text-decoration: " + underlined + ";'>" + task.Text + "</li>";
        activeCellBodies[index].innerHTML += listItem;
    })
}

function setDateListeners(){
    var dateView = document.querySelector(".date-background");
    for (let i = 0; i < activeCells.length; i++){
        activeCells[i].addEventListener("click", function(){
            dateView.style.visibility = "visible";
            document.querySelector(".date-number").textContent = i+1;
            selectedCellIndex = i;
            var dateViewTasks = document.querySelector(".date-body");
            dateViewTasks.innerHTML = "";

            if (activeCells[i].getAttribute("data-date-uuid")) {
                if (activeCellTasks[i].length == 0) {
                    createDefaultDateViewListItem();
                    setListListeners(dateListDetails);
                }
                else {
                    activeCellTasks[i].forEach(function(task){
                        var underlined = "none";
                        if (task.IsUnderlined) underlined = "underline";
                        var listItem = "<span class='date-item' contenteditable='true' style='color: " +
                            task.Color + "; text-decoration: " + underlined + ";'>" + task.Text + "</span>";
                        dateViewTasks.innerHTML += listItem;
                    })
                    setListListeners(dateListDetails);
                }
            }
            else {
                createDate(i);
            }
        })
    }
    var colorBtn = document.querySelector(".text-color-dropdown");
    colorBtn.addEventListener("change", function(){
        dateListDetails.listItems[dateListDetails.activeIndex].style.color = colorBtn.value;
    })
    var backBtn = document.querySelector(".back-button");
    backBtn.addEventListener("click", function(){
        dateView.style.visibility = "hidden";
    })
}

function createDate(i){
    axios.post("/api/dates", {
        data: {
            monthId: monthName.getAttribute("data-month-uuid"),
            date: i + 1,
            check: check
        }
    })
        .then(function(response){
            if (response.data.FoundItem) {
                var dateViewTasks = document.querySelector(".date-body");
                dateViewTasks.innerHTML = "";
                activeCells[i].setAttribute("data-date-uuid", response.data.Item.UUID);
                var tasks = response.data.Item.Tasks;
                tasks.forEach(function(task){
                    activeCellTasks[i].push(task);
                    var underlined = "none";
                    if (task.IsUnderlined) underlined = "underline";
                    var listItem = "<li style='color: " + task.Color + "; text-decoration: " + underlined + ";'>" + task.Text + "</li>";
                    dateViewTasks.innerHTML += listItem;
                })
                activeCells[i].setAttribute("data-date-uuid", response.data.Item.UUID);
                setListListeners(dateListDetails);
            }
            else {
                activeCells[i].setAttribute("data-date-uuid", response.data.Item.UUID);
                createDefaultDateViewListItem();
                setListListeners(dateListDetails);
            }
        })
}

function createDefaultDateViewListItem(){
    var dateViewTasks = document.querySelector(".date-body");
    dateViewTasks.innerHTML = "";
    var listItem = '<span class="date-item" contenteditable="true" data-position="0"></span>';
    dateViewTasks.innerHTML += listItem;
}

previousMonthBtn.addEventListener("click", function(){
    date.setMonth(monthIndex - 1);
    createCalendar();
})

nextMonthBtn.addEventListener("click", function(){
    date.setMonth(monthIndex + 1);
    createCalendar();
})

createCalendar();