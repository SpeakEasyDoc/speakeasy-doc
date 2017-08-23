import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import Paper from 'material-ui/Paper';

//Profile Pic 
//Username
//Logo

class LeftNav extends Component {
  render() {
    return (
      <Drawer 
        docked={true}
        open={true}
        zDepth={1}
        className='left-nav-drawer'
        width={this.props.leftNavWidth}
      >
        <Paper style={{}}>
          <img id="logo" src='img/logo.png' />
        </Paper>
        <Paper style={{'backgroundColor': 'white', 'paddingTop': '10px'}} >
          <Avatar src={this.props.currentUserPic} className="profile-pic" size='80px' />
          <ListItem primaryText={this.props.currentUserName} disabled={true} />
        </Paper>
        <div id="menu-items">
          <MenuItem primaryText='HOME' />
          <MenuItem primaryText='DOCUMENTS' />
          <MenuItem primaryText='CONTACTS' />
          <MenuItem primaryText='SETTINGS' />
        </div>
      </Drawer>
    );
  }
}

export default LeftNav;