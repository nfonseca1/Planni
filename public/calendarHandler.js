var calendarCells = document.querySelectorAll(".calendar-cell");
var monthName = document.querySelector(".month-name");
var date = new Date(); // Today's date

var monthIndex, // Index of month 0 - 11 (January - December)
    firstDayOfMonth, // Index starting from 0 - 6 (Sunday - Saturday)
    lastDateOfMonth, // Last date of month (30, 31 etc.)
    lastDateOfPreviousMonth; // Last date of last month

determineDateInfo();
applyDates();
getMonth();

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
    var previousDates = (lastDateOfPreviousMonth - firstDayOfMonth) + 1;
    var currentDates = 1;
    var nextDates = 1;
    for (var i = 0; i < calendarCells.length; i++){
        if (i < firstDayOfMonth) { // Dates in previous month
            calendarCells[i].textContent = previousDates;
            calendarCells[i].classList.add("inactive-cell");
            previousDates++;
        }
        else if (currentDates <= lastDateOfMonth){ // Dates for this month
            calendarCells[i].textContent = currentDates;
            currentDates++;
        }
        else { // Dates for next month
            calendarCells[i].textContent = nextDates;
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
            console.log("retrieved");
            console.log(response.data);
            monthName.textContent = response.data[0].Month;
        })
}