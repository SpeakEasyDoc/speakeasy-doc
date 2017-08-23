import React, { Component } from 'react';

class CollaboratorsList extends Component {
  render() {
    
    const collaboratorsList = Object.keys(this.props.collaborators).map((c, i) => {
      return (
        <div id={c+i}>
          c
        </div>
      )
    })
    
    return (
      <div id='collaboratorsList'>

      </div>
    )
  }
}

export default CollaboratorsList;