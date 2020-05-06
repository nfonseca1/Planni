import React, {Component} from "react";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: ""
        }
    }
    render() {
        return (
            <div>
                <h3>Login</h3>
                <p>{this.state.errorMsg}</p>
                <form action="/home" method="POST" id="loginForm">
                    <label>Username or Email</label>
                    <input type="text" name="username" required/>
                    <br/>
                    <label>Password</label>
                    <input type="password" name="password" required/>
                    <br/>
                    <button type="submit">Login</button>
                </form>
            </div>
        )
    }
}

export default Login;