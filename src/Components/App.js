import React from 'react';
import { Route, Switch } from "react-router-dom";

import '../Styles/App.css';
import Login from "./Login.js";
import Register from "./Register.js";
import PlannerView from "./PlannerView.js";
function App() {
  return (
    <div className="App">
      <Switch>
        <Route exact path="/" render={routeProps => 
          <div>
            <Login {...routeProps}/>
            <br/>
            <Register {...routeProps}/>
          </div>
        }/>
        <Route exact path="/planner" render={routeProps => <PlannerView {...routeProps}/>}/>
      </Switch>
    </div>
  );
}

export default App;
