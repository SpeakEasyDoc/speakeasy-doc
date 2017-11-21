
KeyHelper = libsignal.KeyHelper;
const store = new SignalProtocolStore();
let recipientObj = {};
let ourSessionCipher;

// Load On Ready 
$(() => {
    $('#register-keys').on('click', registerWithServer);
    $('#get-recipient-keys').on('click', requestReceiversBundle);

    // to create a session, we need to initiate a session AND encrypt and send the first message
    $('#create-session').on('click', startSession);

    // to send following messages, need to only encrypt and send
    // $('#send-message').on('click', encryptMessage);

    $('#decrypt-message').on('click', decryptMessage);
});

//**************REGISTER KEYS*****************/        

const generateIdentity = async (store) => {
    // Generate Registration ID 
    const regId = await KeyHelper.generateRegistrationId();

    // Generate Identity Key Pair - long-term
    const identKeyPair = await KeyHelper.generateIdentityKeyPair();

    console.log("(C): 1) Reg id: ", regId);
    console.log("(C): 2) Ident key: ", identKeyPair);

    // Store Registration ID and Key Pair in the user's local store
    store.put('registrationId', regId);
    store.put('identityKey', identKeyPair);
}


function generateKeysBundle(store) {
    // check our store for Identity Key Pair and registration ID
    // return them  as promises 

    // generate 5 one-time prekeys to be sent to the server
    // - these are one-time ephemeral
    // these generate as promises, need to be resolved before we can use them
    const onetimePrekeys = [];
    for (let keyID = 0; keyID < 5; keyID++) {
        onetimePrekeys.push(KeyHelper.generatePreKey(keyID));
    }
    
    const signedKeyID = Math.floor((Math.random() * 4000) + 1);

    return Promise.all([
        store.getLocalRegistrationId(),
        store.getIdentityKeyPair()
    ]).then((result) => {
        // store Identity Key Pair and Registration ID in temp variables
        const regId = result[0];
        const identKeyPair = result[1];

        return Promise.all([
            // generate one signed prekey - this one is medium term
            KeyHelper.generateSignedPreKey(identKeyPair, signedKeyID),
            ...onetimePrekeys
        ]).then((keys) => {
            // signed prekey pair and signature
            // medium-term, contains: signature and private and corresponding public keys
            // signed with long-term private identity key
            const signedPreKey = keys[0];
            console.log("(C): 3) our signedPreKeyPair is: ", signedPreKey);
            
            // one-time ephemeral prekey pair, contains: private and corresponding public keys
            const preKeys = keys.slice(1);
            // only send public keys (and id) to the server
            const preKeysPublicOnly = preKeys.map((preKey) => {
                return {
                    keyId: preKey.keyId,
                    publicKey: util.toString(preKey.keyPair.pubKey)
                }
            })
            console.log("(C): 4) our multiple one-time ephemeral keys are: ", preKeys);
            
            console.log('(C): 5) keys is', keys)
            
            // Store keys 
            preKeys.forEach((preKey) => store.storePreKey(preKey.keyId, preKey.keyPair));
            store.storeSignedPreKey(signedKeyID, signedPreKey.keyPair);

            console.log("(C): 6) Type of identity key pair ", typeof identKeyPair);
            
            // Bundle all the keys
            // key bundle to be used in initial registration with the server
            return {
                // Our Info: 
                user_info: {
                    recipientId: $('#my-username').val()
                }, 
                // Our Key Bundle: 
                key_bundle: {
                    registrationId: regId,
                    identityKey: util.toString(identKeyPair.pubKey),
                    preKeys: preKeysPublicOnly,
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

            // TODO: check if prekey exists before making it into array buffer
            recipientObj.key_bundle.preKey.publicKey = util.toArrayBuffer(recipientObj.key_bundle.preKey.publicKey);
            recipientObj.key_bundle.signedPreKey.publicKey = util.toArrayBuffer(recipientObj.key_bundle.signedPreKey.publicKey);
            recipientObj.key_bundle.signedPreKey.signature = util.toArrayBuffer(recipientObj.key_bundle.signedPreKey.signature);
            console.log("RecipientObj AFTER applying util.toArrayBuffer: ", recipientObj);
        }
    });
}


const startSession = () => {
    //create receiver address
    const recipientAddress = new libsignal.SignalProtocolAddress(recipientObj.user_info.recipientId, recipientObj.user_info.deviceId);

    console.log("Recipient Address is: ", recipientAddress);

    //create a session builder for receiver's Id + Device Id (Recipient address)
    const sessionBuilder = new libsignal.SessionBuilder(store, recipientAddress);

    console.log("Before authentication. Recipient key bundle is: ", recipientObj.key_bundle);
    
    const ourSessionPromise = sessionBuilder.processPreKey(recipientObj.key_bundle);
    console.log('ourSEssionPromise inside startSession', ourSessionPromise)

    let ourPlainText = $('#my-message').val();

    // finish creating the sssion by sending the first encrypted message
    ourSessionPromise.then(() => {
        enryptAndSendMessage(ourPlainText, recipientAddress);
    }).catch((error) => {
        console.log('Could not start the session. Aborting. Error:', error);
    });
}

const enryptAndSendMessage = (plaintext, recipientAddress) => {
    console.log("Our session in the store is: ", store.loadSession());
    console.log("Time to send message");

    // make sure session cipher exists
    if (!ourSessionCipher) {
        ourSessionCipher = new SessionCipher(store, recipientAddress);
    }
    ourSessionCipher.encrypt(plaintext).then(function (ciphertext) {
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
