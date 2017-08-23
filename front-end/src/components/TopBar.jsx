import React, { Component } from 'react';
import Paper from 'material-ui/Paper';


const TopBar = () => {

  // filterFunction() {
  //   const searchValue = document.getElementById('search').innerHTML;
  //   Object.keys(currentUserDocs).forEach((doc) => {
  //     if (doc.indexOf(searchValue)) results.push(doc);
  //   })
  // }

  return (
    <Paper className="top-bar">
      <input 
        type="text" 
        id="search" 
        placeholder="Search for a document or a contact" 
        // onkeyup={this.filterFunction()}
      />
    </Paper>
  )
}

export default TopBar;