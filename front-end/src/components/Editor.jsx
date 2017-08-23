import React, { Component } from 'react';


class Editor extends Component {

  render() {
      return (
          <div id='hyperpad'>
            <div id="wrap">
              {/* <h1 id="title">Initializing..</h1> */}
              {/* <input id="new-pad" type="button" value="New Pad" onclick="onNewPad()"/> */}
              {/* <div id="hint">Share this URL to let others edit this pad!</div> */}
              <textarea id="pad" placeholder="A shining, brand new document.">Initializing..</textarea>
              {/* <div class="logo">hyper<span class="logo2">PAD</span></div> */}
            </div>
          </div>
      )
  }
}

export default Editor;