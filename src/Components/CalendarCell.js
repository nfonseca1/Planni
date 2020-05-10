import React, {Component} from "react";
import "../Styles/CalendarCell.css";

class CalendarCell extends Component{
    render(){
        return (
            <div className="CalendarCell">
                <h5>{this.props.date}</h5>
            </div>
        )
    }
}

export default CalendarCell;