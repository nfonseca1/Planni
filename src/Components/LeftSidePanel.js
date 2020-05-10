import React, {Component} from "react";
import "../Styles/LeftSidePanel.css";

class LeftSidePanel extends Component{
    render(){
        return (
        <div className="LeftSidePanel">
            <div className="layers">
                <h3>{this.props.layersName}</h3>
            </div>
        </div>
        )
    }
}

export default LeftSidePanel;