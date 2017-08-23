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
            "preKey": {
                "keyId": keyBundle.preKey.keyId,//333
                "publicKey": keyBundle.preKey.publicKey,//"rtyc45vycw4vyc4s5yscg54"
            }
        }
    };

    console.log('(S): Our identityObj before saving: ', identity);

    User.create(identity, (err, doc) => {
        if (err) res.status(500).send("Could not register. Try again."); // HERE's THE ERROR FUCK
        else res.status(200).send(doc)
    });
}

// Serve the Receiver's Key Bundle to Sender if receiver is found
const findIdentity = (req, res) => {

    // Extract Receiver's registration ID from req.params 
    const receiverRecipientId = req.params.recipientId;
    console.log("our receiver reg id is: ", receiverRecipientId);
    console.log("Type of receiverRegId", typeof receiverRecipientId);

    User.findOne({"user_info.recipientId": receiverRecipientId}, (err, doc) => {
        if (err) {
            console.log("Inside of (err,doc)");
            res.send(err);
        } else {
            console.log("Receiver's key bundle is: ", doc);
            res.status(200).send(doc);
            // delete ephemeral keys here 
        }
    });
}

// const startSession = (req, res, next) => {
//     //send short term one-time keys for messages
//     //chain message
// }

module.exports = { saveIdentity, findIdentity };