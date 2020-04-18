var notesView = document.querySelector(".notes-view-container");
var calendarCells = document.querySelectorAll(".calendar-cell");
var activeCells = [];
var activeCellTasks = [];
var selectedCellIndex;
var check = true;

var monthName = document.querySelector(".month-name");
var date = new Date(); // Today's date
var monthIndex, // Index of month 0 - 11 (January - December)
    firstDayOfMonth, // Index starting from 0 - 6 (Sunday - Saturday)
    lastDateOfMonth, // Last date of month (30, 31 etc.)
    lastDateOfPreviousMonth; // Last date of last month

determineDateInfo();
applyDates();
getMonth();
setDateListeners();

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
            activeCellTasks.push(calendarCells[i].querySelector(".date-cell-tasks"));
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
                var tasksArea = document.querySelector(".monthly-tasks");
                tasksArea.innerHTML = "";
                for (var i = 0; i < tasks.length; i++){
                    tasksArea.innerHTML += '<span class="task-item" contenteditable="true" data-position="0">' +
                        tasks[i] + '</span>'
                }
                setListListeners(listDetails);
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
            for (let i = 1; i <= activeCells.length; i++){
                // If date is later than the last retrieved db date, stop
                if (i > response.data[response.data.length - 1].Date) break;
                // Otherwise, loop through each retrieved db date and see if theres a match
                for (let x = 0; x < response.data.length; x++){
                    if (response.data[x].Date == i){ // If there's a match, fill in the date cell data
                        // Fill in date data
                        response.data[x].Tasks.forEach(function(task){
                            var underlined = "none";
                            if (task.IsUnderlined) underlined = "underline";
                            activeCellTasks[i].innerHTML += "<li style='color: " + task.Color + "; text-decoration: " + underlined + ";'>" + task.Text;
                        })
                        break;
                    }
                    else if (response.data[x].Date > i){ // If the data's date is greater than what we're looking for, stop
                        break;
                    }
                }
            }
        })
}

function setDateListeners(){
    var dateView = document.querySelector(".date-background");
    for (let i = 0; i < activeCells.length; i++){
        activeCells[i].addEventListener("click", function(){
            dateView.style.visibility = "visible";
            document.querySelector(".date-number").textContent = i+1;
            selectedCellIndex = i;
            setListListeners(dateListDetails);

            if (activeCells[i].getAttribute("data-date-uuid")) {

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
                activeCells[i].setAttribute("data-date-uuid", response.data.Item.UUID);
                console.log(response.data.Item);
            }
            else {
                activeCells[i].setAttribute("data-date-uuid", response.data.Item.UUID);
                console.log(response.data.Item.UUID);
            }
        })
}
