import React from "react";
import CalendarCell from "../Components/CalendarCell";

function gatherCells(firstDay, lastDate, prevLastDate) // Loop through calendar cells and apply date number to appropriate cell
{
    var currentDate = (prevLastDate - firstDay) + 1;
    var index = 0;

    var addedPrevDates = false;
    var lastDateAdded = false;
    
    if (firstDay === 0){
        currentDate = 1;
        addedPrevDates = true;
    }
    var cells = [];

    while((lastDateAdded === false || index % 7 !== 0)){
        cells.push(<CalendarCell date={currentDate}/>)
        if (currentDate === lastDate && addedPrevDates) lastDateAdded = true;
        if (currentDate === prevLastDate && addedPrevDates === false) {
            currentDate = 1;
            addedPrevDates = true;
        }
        else if (currentDate === lastDate && addedPrevDates === true) currentDate = 1;
        else currentDate++;
        index++;
    }
    return cells;
}

export {gatherCells};