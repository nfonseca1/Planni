import React, {Component} from "react";
import "../Styles/Register.css";
import axios from "axios";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: "",
            username: "",
            password: ""
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    handleChange(e){
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    handleClick(){
        this.attemptLogin();
    }
    attemptLogin(){
        axios.post("/login", {
            username: this.state.username,
            password: this.state.password
        })
        .then(response => {
            if (response.data.error) this.setState({error: response.data.error})
            else {
                console.log(response);
                this.props.history.push("/planner");
            }
        })
    }
    render() {
        return (
            <div className="Login">
                <h3>Login</h3>
                <p>{this.state.error}</p>
                <label>Username or Email</label>
                <input type="text" name="username" onChange={this.handleChange} required/>
                <br/>
                <label>Password</label>
                <input type="password" name="password" onChange={this.handleChange} required/>
                <br/>
                <button type="submit" onClick={this.handleClick}>Login</button>
            </div>
        )
    }
}

export default Login;