<h2>SpeakEasyDoc.io</h2> 

<strong>Description:</strong> building a real-time collaborative text-editor with end-to-end encryption. SpeakEasyDoc integrates HyperPad, a peer-to-peer text editor, with Open Whisper System’s Signal Protocol to achieve end-to-end encryption. 


<strong>Current Version: 0.0.1</strong>
<strong>Note:</strong> Integration of HyperPad and the Signal JavaScript protocol is not yet complete. 

To achieve end-to-end encryption between two users (i.e. Alice and Bob), our tool implements the Signal Protocol in the following manner:

<ul> 
  <li>Upon installation, a registration ID, a long-term identity key pair, a medium term prekey pair, a signed prekey, and a one-time session key pair are generated for each client (i.e. Alice and Bob). </li> 
  <li>The client’s registration ID and public keys are bundled into a Key Bundle object and sent over to our Key Distribution Server </li>
  <li>If an initiator (Alice) desires to connect with a recipient (Bob), our Key Distribution Center responds with the recipient’s key bundle</li>  
  <li>The initiator then uses the recipient’s key bundle to generate a master shared secret which is then used to encrypt/decrypt messages </li> 
  <li>Each message that’s sent uses a new pair of ephemeral keys (one-time session) therefore guaranteeing forward secrecy and cryptographic deniability</li> 
</ul> 

UI
Custom user interface, which integrates HyperPad, to allow users keep track of the documents they have saved and the collaborators they have connected with. Not fully integrated with our Signal Protocol implementation. 
