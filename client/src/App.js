import React from 'react';
import logo from './logo.svg';
import { sendData } from "./App.service";
import './App.css';

class App extends React.Component {
  render() {
    return ( 
    <      div className = "App" >
      <input type = "number" />
      <button onClick={()=>(sendData({action:'set',value:1}))}>Set</button>
      <button>Add</button>
      <button>Sub</button>
      </div>
    );
  }
}

export default App;
