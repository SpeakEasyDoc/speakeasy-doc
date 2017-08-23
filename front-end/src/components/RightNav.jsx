import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
// import AddCircleIcon from './../../public/img/ic_add_circle_outline_black_24px.svg';
// import CollaboratorsList from './CollaboratorsList.jsx';


class RightNav extends Component {

  // constructor() {
  //   super(props)
  //   this.state = {
  //     collaborators: {}
  //   }
  // }
  
  // addCollaborator(event, index, value) {
  //   const newCollaborator = 'collaborator' + index
  //   this.setState({
  //     collaborators: {
  //       newCollaborator: value
  //     }
  //   });
  // }

  render() {

    const currentUserFriends = this.props.currentUserFriends.map((friend, index) => {
      return <MenuItem value={index + 1} primaryText={friend} />
    })

    return(
      <div className='right-nav'>
        <DropDownMenu 
          value='Add Collaborator'
          onChange={this.addCollaborator} 
          anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
          // iconButton='<AddCircleIcon />'

        >
          {currentUserFriends}
        </DropDownMenu>
        {/* <CollaboratorsList collaborators={this.state.collaborators} /> */}
      </div>
    )
  }
}

export default RightNav;