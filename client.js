
KeyHelper = libsignal.KeyHelper;
const store = new SignalProtocolStore();
let recipientObj = {};
let ourSessionPromise;
let ourSessionCipher;

// Load On Ready 
$(() => {
    $('#register-keys').on('click', registerWithServer);
    $('#get-recipient-keys').on('click', requestReceiversBundle);
    $('#create-session').on('click', startSession);
    $('#send-message').on('click', encryptMessage);
    $('#decrypt-message').on('click', decryptMessage);
});

//**************REGISTER KEYS*****************/        

const generateIdentity = async (store) => {
    // Generate Registration ID 
    const regId = await KeyHelper.generateRegistrationId();

    // Generate Identity Key Pair 
    const identKeyPair = await KeyHelper.generateIdentityKeyPair();

    console.log("(C): 1) Reg id: ", regId);
    console.log("(C): 2) Ident key: ", identKeyPair);

    // Store Registration ID and Key Pair in the store
    store.put('registrationId', regId);
    store.put('identityKey', identKeyPair);
}


function generateKeysBundle(store) {
    // check our store for Identity Key Pair and registration ID
    // return them  as promises 
    const keyID = Math.floor((Math.random() * 4000) + 1); // Our made up key ID 
    const signedKeyID = Math.floor((Math.random() * 4000) + 1)

    return Promise.all([
        store.getLocalRegistrationId(),
        store.getIdentityKeyPair()
    ]).then((result) => {
        // store Identity Key Pair and Registration ID in temp variables
        var regId = result[0];
        var identKeyPair = result[1];

        // generatePreKey and signedPreKeys 
        return Promise.all([
            KeyHelper.generatePreKey(keyID), // fix  
            KeyHelper.generateSignedPreKey(identKeyPair, signedKeyID) // identKey, keyId
        ]).then((keys) => {
            const preKey = keys[0];
            console.log("(C): 3) our PreKeyPair is: ", preKey);
            const signedPreKey = keys[1];
            console.log("(C): 4) our signedPreKeyPair is: ", preKey);
            console.log('(C): 5) keys is', keys)

            // Store keys 
            store.storePreKey(keyID, preKey.keyPair);
            store.storeSignedPreKey(signedKeyID, signedPreKey.keyPair);

            // Bundle all the keys 
            console.log("(C): 6) Type of identity key pair ", typeof identKeyPair);

            return {
                // Our Info: 
                user_info: {
                    recipientId: $('#my-username').val()
                }, // Our Key Bundle: 
                key_bundle: {
                    registrationId: regId,
                    identityKey: util.toString(identKeyPair.pubKey),  //util.toString(identKeyPair.pubKey),
                    preKey: {
                        keyId: keyID,
                        publicKey: util.toString(preKey.keyPair.pubKey),
                    },
                    signedPreKey: {
                        keyId: signedKeyID,
                        publicKey: util.toString(signedPreKey.keyPair.pubKey),
                        signature: util.toString(signedPreKey.signature)
                    }
                }
            };

        });
    });
}


function registerWithServer() {
    generateIdentity(store).then(async () => {
        // let keyBundle = await generateKeysBundle(store);
        // console.log("(C): 7) our key bundle is", keyBundle);
        // console.log("(C): 8) Our stringified key bundle is: ", JSON.stringify(keyBundle));
        // ajaxCall(keyBundle); 
        ajaxRegisterKeys(await generateKeysBundle(store));

        // return keyBundle;  
    });
}


const ajaxRegisterKeys = (dataObj) => {
    console.log('(C) 9) Our OBJ before ajax call: ', dataObj);
    console.log('(C) 10) typeof OBJ before ajax call: ', typeof dataObj);
    // this is where we could possibly attach our recipient ID and device ID 
    // Divice ID could be 0 since we only have 1 device 
    // We can make recipient ID equal to a string, say a unique username @justino 

    $.ajax({
        type: 'POST',
        url: 'http://localhost:3030/register',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(dataObj) // POTENTIAL PROBLEM HERE 
    }).done((d) => {
        console.log('Our data - inside of ajax call - is: ', d);
    });
}


//**************START SESSION*****************/
function getRecipientIdFromPage() {
    let recipientId = $('#recipient-id').val();
    // Ideally this is where validation would occur and prompt the user
    // to correct any mistakes ()
    return recipientId;
}

// request Receiver's Key Bundle 
function requestReceiversBundle() {
    // ajax GET request to server at  /connect/:registrationId 
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3030/connect/' + getRecipientIdFromPage(),
        dataType: 'json',
        error: () => {
            console.log("an error occurred while requesting Key Bundle.");
        },
        success: (data) => {
            // receive Receiver's key bundle and store it in store
            console.log("Our recipient's key bundle is: ", data);
            recipientObj = data;  // don't forget to use util.toArrayBuffer() on keys 

            console.log("Identity key BEFORE applying util.toArrayBuffer: ", recipientObj);
            recipientObj.key_bundle.identityKey = util.toArrayBuffer(recipientObj.key_bundle.identityKey);
            recipientObj.key_bundle.preKey.publicKey = util.toArrayBuffer(recipientObj.key_bundle.preKey.publicKey);
            recipientObj.key_bundle.signedPreKey.publicKey = util.toArrayBuffer(recipientObj.key_bundle.signedPreKey.publicKey);
            recipientObj.key_bundle.signedPreKey.signature = util.toArrayBuffer(recipientObj.key_bundle.signedPreKey.signature);
            console.log("RecipientObj AFTER applying util.toArrayBuffer: ", recipientObj);
        }
    });
}

let recipientAddress;



const startSession = () => {
  //create receiver address
  recipientAddress = new libsignal.SignalProtocolAddress(recipientObj.user_info.recipientId, recipientObj.user_info.deviceId);

  console.log("Recipient Address is: ", recipientAddress);

  //create a session builder for receiver's Id + Device Id (Recipient address)
  let sessionBuilder = new libsignal.SessionBuilder(store, recipientAddress);

  console.log("Before authentication. Recipient key bundle is: ", recipientObj.key_bundle);
  console.log('ourSEssionPromise inside startSession before', ourSessionPromise)
  
  ourSessionPromise = sessionBuilder.processPreKey(recipientObj.key_bundle);
  console.log('ourSEssionPromise inside startSession', ourSessionPromise)
  // console.log('recipient key bundle after processPreKey: ', recipientObj.key_bundle);
  // console.log('sessionBuilder.processPreKey: ', sessionBuilder.processPreKey(recipientObj.key_bundle));
  // returns session promise
  // console.log('this is our session promise: ', ourSessionPromise);
  // return ourSessionPromise;
}

const encryptMessage = (plaintext) => {
  let ourPlainText = $('#my-message').val();
  console.log('We typed: ', ourPlainText);
  console.log('ourSessionPromise?', ourSessionPromise)
  ourSessionPromise.then(function onsuccess() {
      console.log("Our session in the store is: ", store.loadSession());
      console.log("Time to send message");

      //if session cipher exists
      if (!ourSessionCipher) {
          ourSessionCipher = new SessionCipher(store, recipientAddress);
      }
      ourSessionCipher.encrypt(ourPlainText).then(function (ciphertext) {
          console.log('Our ciphertext.body is: ', ciphertext.body);
          const messageToSend = {
              recipientId: recipientObj.user_info.recipientId,
              message: util.toString(ciphertext.body)
          };
          console.log('recipient ID', messageToSend.recipientId)
          console.log('Message to send: ', messageToSend);

          $.ajax({
              type: 'POST',
              url: 'http://localhost:3030/message/',
              data: JSON.stringify(messageToSend),
              contentType: 'application/json',
              error: () => {
                  console.log('Could not encrypt plaintext!');
              },
              success: (data) => {
                  //push into messagesArray to let user know if this is the first time decrypting a message
                  console.log('\n\n\n\nData sent back from the server and about to be save in messages array is:\n\n', data)
                  recipientObj.user_info.messagesArray.push(data);
                  console.log('Message sent + encrypted in: ', recipientObj.user_info.messagesArray);
              }
          });
      });
  });
}

//Decrypting Message:
const decryptMessage = (ciphertext) => {
  
  $.ajax({
    type: 'GET',
    url: 'http://localhost:3030/get-message/' + $('#my-username').val(),
    dataType: 'json',
    error: () => {
        console.log('Could not get message from server!');
    },
    success: (data) => {
        console.log('data we got back from GET request', data);
        ciphertext = util.toArrayBuffer(data.user_info.messagesArray[data.user_info.messagesArray.length - 1]); // retrieve last message only 
        console.log('\n\nciphertext buffer is', ciphertext);
        if (recipientObj.user_info.messagesArray.length === 1) {
            //if it's the first time I am decrypting, then 
            console.log('inside first if')
            ourSessionCipher.decryptPreKeyWhisperMessage(ciphertext, 'binary').then(function (plaintext) {
                console.log('insideSessionCipher')
                $('#incoming-message-container').append('\n' + util.toString(plaintext));  
                // return util.toString(plaintext);
            });
        } else {
            console.log('inside else statement')
            ourSessionCipher.decryptWhisperMessage(ciphertext, 'binary').then(function (plaintext) {
                $('#incoming-message-container').append('\n' + util.toString(plaintext));  
                // return util.toString(plaintext);
            });
        }
      }
    });

}

// startSession = () => {
//     console.log('Our recipientOb is ', recipientObj);

//     //  create receiver address 
//     recipientAddress = new libsignal.SignalProtocolAddress(recipientObj.user_info.recipientId, recipientObj.user_info.deviceId);

//     console.log("Recipient address is: ", recipientAddress);

//     // create a session builder for a receiver's ID + device ID - (Receiver's address )
//     let sessionBuilder = new libsignal.SessionBuilder(store, recipientAddress);

//     console.log("Befeore authentication. Our key bundle is: ", recipientObj.key_bundle);
//     // process pre keys (verification & authenticaiton)

//     const sessionPromise = sessionBuilder.processPreKey(recipientObj.key_bundle);

//     // create session record 
//     //const sessionRecord = libsignal.SessionRecord(); 

//     sessionPromise.then(function onsuccess() {

//         console.log("our session in the store is: ", store.loadSession()); 

//         console.log("Time to send message");
//         var plaintext = "Hello world";
//         var ourSessionCipher = new SessionCipher(store, recipientAddress);
//         console.log("Our Session Record is: ", ourSessionCipher.getRecord(recipientAddress)); 
//         ourSessionCipher.encrypt(plaintext).then(function (ciphertext) {
//             // ciphertext -> { type: <Number>, body: <string> }
//             handle(ciphertext.type, ciphertext.body); // HERE NOW 
//         });
//     });
// }