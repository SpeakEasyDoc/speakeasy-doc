const mongoose = require('mongoose');

const User = require('./userModel');


//Save Identity and Key Bundle in Database 
const saveIdentity = (req, res, next) => {

    const keyBundle = req.body.key_bundle;
    const userInfo = req.body.user_info;

    console.log("(S): Our body is: ", req.body);
    console.log("(S): Our user info is: ", userInfo);
    console.log("(S): Our key bundle is ", keyBundle);
    console.log("(S): our identity key is: ", keyBundle.identityKey);
    console.log("(S): Type of our keyBundle: ", typeof keyBundle);


    const identity = {
        "user_info": {
            "recipientId": userInfo.recipientId
        },
        "key_bundle": {
            "registrationId": keyBundle.registrationId,//6969
            "identityKey": keyBundle.identityKey, //"sdfjaspdfjasdfjsladf"
            "signedPreKey": {
                "keyId": keyBundle.signedPreKey.keyId, //222
                "publicKey": keyBundle.signedPreKey.publicKey, // "dfasgSGAWGASGWRGVASGSA",// //
                "signature": keyBundle.signedPreKey.signature //"DGASGASGDAGSfasvvdrse5vvys6"
            },
            "preKeys": keyBundle.preKeys //an array of public prekeys and their keyId's
        }
    };

    console.log('(S): Our identityObj before saving: ', identity);

    User.create(identity, (err, doc) => {
        if (err) res.status(500).send("Could not register. Try again.");
        else res.status(200).send(doc)
    });
}

// Serve the Receiver's Key Bundle to Sender if receiver is found
const findIdentity = (req, res, next) => {

    // Extract Receiver's registration ID from req.params 
    const receiverRecipientId = req.params.recipientId;
    console.log("our receiver reg id is: ", receiverRecipientId);
    console.log("Type of receiverRegId", typeof receiverRecipientId);

    // find the receiver
    // delete one of ephemeral prekeys here, as it is issued to Sender/Alice
    User.findOneAndUpdate(
        {"user_info.recipientId": receiverRecipientId},
        // remove first element of the preKeys array
        {$pop: {"key_bundle.preKeys": -1}},
        // userData is passed to the callback BEFORE removing first preKeys array element
        {new: false},
        (err, userData) => {
            if (err) {
                console.log("Inside of findIdentity error:");
                res.send(err);
            } else {
                console.log("\n\n\n\n\nReceiver's database entry on server is:", userData);

                // only include one of ephemeral prekeys here, the first one in the array, not the whole set
                const preKeyToGiveAlice = userData.key_bundle.preKeys[0];
                let userDataForAlice
                if (!preKeyToGiveAlice) {
                    // if no more onetime preKeys are left, send key bundle without onetime prekeys
                    userDataForAlice = {
                        user_info: userData.user_info,
                        key_bundle: { 
                            registrationId: userData.key_bundle.registrationId,
                            identityKey: userData.key_bundle.identityKey,
                            signedPreKey: userData.key_bundle.signedPreKey
                        }
                    }
                } else {
                    // if there's still at least one ephemeral preKey left, include ONE prekey in the key bundle
                    userDataForAlice = {
                        user_info: userData.user_info,
                        key_bundle: { 
                            registrationId: userData.key_bundle.registrationId,
                            identityKey: userData.key_bundle.identityKey,
                            signedPreKey: userData.key_bundle.signedPreKey,
                            preKey: preKeyToGiveAlice
                        }
                    }
                }

                res.status(200).send(userDataForAlice);
            }
        }
    );
}

const saveMessage = (req, res, next) => {
    const sentMessage = req.body;
    console.log('\n\n\n\nIn saveMessage (server): ', req.body);

    User.findOneAndUpdate(
        {"user_info.recipientId": req.body.recipientId}
        , {$push: { "user_info.messagesArray": req.body} }
        , {new: true}
        , (err, doc) => {
            if (err) {
                console.log('Error saving message');
            } else {
                console.log('Our recipient\'s message array is: ', doc.user_info.messagesArray);
                res.status(200).send(doc);
            }
        }
    );
}

const retrieveMessages = (req, res, next) => {
    User.findOne(
        {"user_info.recipientId": req.params.recipientId}
        , (err, userData) => {
            if (err) {
                console.log('Error retriving messages:', err);
            } else {
                console.log('Our recipient\'s message array is: ', userData.user_info.messagesArray);
                // we do not need to send their own key bundle to the user
                // (user already has copies of his own keys)
                // only send the messages on file for the user
                res.status(200).send(userData.user_info.messagesArray);
            }
        }
    );
}

module.exports = { 
    saveIdentity, 
    findIdentity, 
    saveMessage, 
    retrieveMessages
};