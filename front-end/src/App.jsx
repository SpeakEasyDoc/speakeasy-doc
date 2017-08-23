import React, { Component } from 'react';
import TopBar from './components/TopBar.jsx';
import LeftNav from './components/LeftNav.jsx';
import Editor from './components/Editor.jsx';
import RightNav from './components/RightNav.jsx';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {purple50, black} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import { BrowserRouter as Router, Route, Link } from "react-router-dom";

// import appStyle from './styles/appStyle.css';

const muiTheme = getMuiTheme({
  palette: {
    canvasColor: purple50,
    textColor: black,
  },
  fontFamily: 'Roboto, sans-serif',
});

class App extends Component {

  constructor() {
    super();
    this.state = {
      currentUserPic: "./img/Janelle.png",
      currentUserName: 'Janelle Wong',
      currentUserFriends: ['Ksenia', 'Justino'],
      currentUserDocs: {
        secretDoc1: 'xxx',
        secretDoc2: 'yyy',
      }
    }
  }

  componentDidMount() {
    const script = document.createElement('script');

    script.src = './js/bundle-hyperpad.js';
    // script.async = true;

    document.getElementById('hyperpad').appendChild(script).attr('id', 'hyperpadScript');
  }

  render() {
    const propsToPass = {
      currentUserPic: this.state.currentUserPic,
      currentUserName: this.state.currentUserName,
      leftNavWidth: '20%',
      currentUserFriends: this.state.currentUserFriends,
      currentUserDocs: this.state.currentUserDocs,
    }
    return (
      <MuiThemeProvider muiTheme={muiTheme} >
        <div id='react-root'>
          <TopBar />
          <div id='horiz-elems'>
            <LeftNav {...propsToPass} /> 
            <Editor />
            <RightNav {...propsToPass} />
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
