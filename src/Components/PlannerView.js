import React, {Component} from "react";
import LeftSidePanel from"./LeftSidePanel";
import Calendar from "./Calendar";
import RightSidePanel from "./RightSidePanel";
import "../Styles/PlannerView.css";

class PlannerView extends Component{
    constructor(props){
        super(props);
        this.state = {
            firstDayOfMonth: 0,
            lastDateOfMonth: 30,
            lastDateOfPreviousMonth: 31,
            monthIndex: 0
        }
        this.toggleMonth = this.toggleMonth.bind(this);
    }
    componentDidMount(){
        this.calculateDateInfo(new Date());
    }
    calculateDateInfo(startDate) {
        var date = startDate; // Today's date
    
        var monthIndex = date.getMonth();
        // GET FIRST DAY OF THE MONTH
        date.setDate(1);
        var firstDayOfMonth = date.getDay(); // Index starting from 0 - 6 (Sunday - Saturday)
        // GET LAST DATE OF THE MONTH
        var nextMonthIndex = monthIndex + 1;
        if (nextMonthIndex > 11) nextMonthIndex = 0;
        date.setMonth(nextMonthIndex);
        date.setDate(0); // Sets to last date of previous month (This month)
        var lastDateOfMonth = date.getDate(); // Last date of month (30, 31 etc.)
        // GET LAST DATE OF PREVIOUS MONTH
        date.setDate(0); // Sets to last date of previous month
        var lastDateOfPreviousMonth = date.getDate(); // Last date of last month
        date.setMonth(monthIndex); // Set back to this month
        
        this.setState({
            firstDayOfMonth: firstDayOfMonth,
            lastDateOfMonth: lastDateOfMonth,
            lastDateOfPreviousMonth: lastDateOfPreviousMonth,
            monthIndex: monthIndex
        })
    }
    toggleMonth(index){
        var date = new Date();
        date.setMonth(index);
        this.calculateDateInfo(date);
    }
    render(){
        return (
            <div>
            <LeftSidePanel layersName="Filters"/>
            <Calendar monthIndex={this.state.monthIndex}
                firstDayOfMonth={this.state.firstDayOfMonth} 
                lastDateOfMonth={this.state.lastDateOfMonth} 
                lastDateOfPreviousMonth={this.state.lastDateOfPreviousMonth}
                toggleMonth={this.toggleMonth}
            />
            <RightSidePanel/>
            </div>
        )
    }
}

export default PlannerView;