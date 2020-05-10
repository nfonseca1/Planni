import React, {Component} from "react";
import {gatherCells} from "../helpers/calendarHandler";
import "../Styles/Calendar.css";

class Calendar extends Component{
    static defaultProps = {
        monthNames: ["January", "February", "March", "April", "May", "June", 
            "July", "August", "September", "October", "November", "December"]
    }
    constructor(props){
        super(props);
        this.handlePrevious = this.handlePrevious.bind(this);
        this.handleNext = this.handleNext.bind(this);
    }
    handlePrevious(){
        var prevIndex = this.props.monthIndex - 1;
        this.props.toggleMonth(prevIndex);
    }
    handleNext(){
        var nextIndex = this.props.monthIndex + 1;
        this.props.toggleMonth(nextIndex);
    }
    render(){
        const firstDay = this.props.firstDayOfMonth;
        const prevLastDate = this.props.lastDateOfPreviousMonth;
        const lastDate = this.props.lastDateOfMonth;
        
        var cells = gatherCells(firstDay, lastDate, prevLastDate);

        return (
            <div className="Calendar">
                <div className="header">
                    <button onClick={this.handlePrevious}>Previous</button>
                    <span>{this.props.monthNames[this.props.monthIndex]}</span>
                    <button onClick={this.handleNext}>Next</button>
                </div>
                <div className="dates">
                    {cells}
                </div>
            </div>
        )
    }
}

export default Calendar;