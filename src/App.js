import React from 'react';
import { Route, Switch } from "react-router-dom";

import './App.css';
import Login from "./Login.js";
import Register from "./Register.js";
import Planner from "./Planner.js";
function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" render={routeProps => 
          <div>
            <Login/>
            <br/>
            <Register {...routeProps}/>
          </div>
        }/>
        <Route exact path="/planner" render={routeProps => <Planner/>}/>
      </Switch>
    </div>
  );
}

export default App;
