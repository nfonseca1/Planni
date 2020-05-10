import React, {Component} from "react";
import "../Styles/Register.css";
import validateAll from "../helpers/validation";
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
                lastnameMsg: "",
                emailMsg: "",
                usernameMsg: "",
                passwordMsg: "",
                confirmPasswordMsg: "",
            },
            activeFields: {
                firstnameActive: false,
                lastnameActive: false,
                emailActive: false,
                passwordActive: false,
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
            activeFields: {
                ...this.state.activeFields,
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
        var actives = Object.values(this.state.activeFields);
        if (actives.every(a => a === false)) {
            this.setState({formErr: "One or more fields were not properly filled in"});
            return;
        }
        this.setState({
            activeFields: {
                firstnameActive: true,
                lastnameActive: true,
                emailActive: true,
                passwordActive: true,
                confirmPasswordActive: true
            }
        }, () => {
            for (let prop in this.state.inputs){
                let err = this.state.errors[prop + "Msg"];
                let active = this.state.activeFields[prop + "Active"];
                if (err !== "" && active) return;
            }
            this.attemptRegistration();
        })
    }
    attemptRegistration() {
        axios.post("/register", {
            data: {
                firstname: this.state.inputs.firstname,
                lastname: this.state.inputs.lastname,
                email: this.state.inputs.email,
                username: this.state.inputs.username,
                password: this.state.inputs.password
            }
        })
        .then(res => {
            console.log(res.data);
            if (res.data.error) this.setState({formErr: res.data.error})
            else {
                this.props.history.push("/planner");
            }
        });
    }
    render(){
        var err = this.state.errors;
        var active = this.state.activeFields;
        return (
            <div className="Register">
                <h3>Register</h3>
                <p>{this.state.formErr}</p>
                <label htmlFor="firstname">First Name</label>
                <input type="text" id="firstname" name="firstname" onChange={this.handleChange} required autoComplete="off"/>
                <p>{active.firstnameActive && err.firstnameMsg}</p>
                <label htmlFor="lastname">Last Name</label>
                <input type="text" id="lastname" name="lastname" onChange={this.handleChange} required autoComplete="off"/>
                <p>{active.lastnameActive && err.lastnameMsg}</p>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" onChange={this.handleChange} required autoComplete="off"/>
                <p>{active.emailActive && err.emailMsg}</p>
                <label htmlFor="username">Username (optional)</label>
                <input type="text" id="username" name="username" onChange={this.handleChange} autoComplete="off"/>
                <p>{err.usernameMsg}</p>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" onChange={this.handleChange} required autoComplete="off"/>
                <p>{active.passwordActive && err.passwordMsg}</p>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" onChange={this.handleChange} required autoComplete="off"/>
                <p>{active.confirmPasswordActive && err.confirmPasswordMsg}</p>
                <button onClick={this.handleClick} id="registerBtn">Register</button>
            </div>
        )
    }
}

export default Register;