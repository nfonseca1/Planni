import React, {Component} from "react";
import "./Register.css";
import validateAll from "./helpers/validation";
import axios from "axios";

class Register extends Component {
    constructor(props){
        super(props)
        this.state = {
            inputs: {
                firstname: "",
                lastname: "",
                email: "",
                username: "",
                password: "",
                confirmPassword: ""
            },
            formErr: "",
            errors: {
                firstnameMsg: "",
                firstnameActive: false,
                lastnameMsg: "",
                lastnameActive: false,
                emailMsg: "",
                emailActive: false,
                usernameMsg: "",
                passwordMsg: "",
                passwordActive: false,
                confirmPasswordMsg: "",
                confirmPasswordActive: false
            }
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    handleChange(e){
        this.setState({
            inputs: {
                ...this.state.inputs,
                [e.target.name]: e.target.value
            },
            errors: {
                ...this.state.errors,
                [e.target.name + "Active"]: true
            }
        }, () => {
            var errorMsgs = validateAll(this.state.inputs);
            this.setState({
                errors: {
                    ...this.state.errors,
                    ...errorMsgs
                }
            })
        })
    }
    handleClick(){
        for (let prop in this.state.errors){
            if (this.state.errors[prop] !== "") return;
        }
        axios.post("/register", {
            data: {
                firstname: this.state.firstname,
                lastname: this.state.lastname,
                email: this.state.email,
                username: this.state.username,
                password: this.state.password
            }
        })
        .then(res => {
            console.log(res.data);
            if (res.data.error) this.setState({formMsg: res.data.error})
            else {
                this.props.history.push("/planner");
            }
        });
    }
    render(){
        var err = this.state.errors;
        return (
            <div className="Register">
                <h3>Register</h3>
                <p>{this.state.formMsg}</p>
                <label for="firstname">First Name</label>
                <input type="text" id="firstname" name="firstname" onChange={this.handleChange} required/>
                <p>{err.firstnameActive && err.firstnameMsg}</p>
                <label for="lastname">Last Name</label>
                <input type="text" id="lastname" name="lastname" onChange={this.handleChange} required/>
                <p>{err.lastnameActive && err.lastnameMsg}</p>
                <label for="email">Email</label>
                <input type="email" id="email" name="email" onChange={this.handleChange} required/>
                <p>{err.emailActive && err.emailMsg}</p>
                <label for="username">Username (optional)</label>
                <input type="text" id="username" name="username" onChange={this.handleChange} />
                <p>{err.usernameMsg}</p>
                <label for="password">Password</label>
                <input type="password" id="password" name="password" onChange={this.handleChange} required/>
                <p>{err.passwordActive && err.passwordMsg}</p>
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" onChange={this.handleChange} required/>
                <p>{err.confirmPasswordActive && err.confirmPasswordMsg}</p>
                <button onClick={this.handleClick} id="registerBtn">Register</button>
            </div>
        )
    }
}

export default Register;