const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const mLabURI = 'mongodb://jmora3:Mlab.JMpass3!@ds155841.mlab.com:55841/signal_testdb'; 
// Janelle's Mlab uri: 'mongodb://signaltest:1234@ds137730.mlab.com:37730/signaluser'

const URI = process.env.MONGO_URI || mLabURI; 

mongoose.connect(mLabURI);
mongoose.connection.once('open', () => {
    console.log('Connected with database!');
});

const userSchema = new Schema({
    user_info: {
        recipientId: {
            type: String
        }, 
        deviceId: {
            type: Number,
            default: 0
        }
    },
    key_bundle: {
        registrationId: {
            type: Number
        },
        identityKey: {
            type: String
        },
        signedPreKey: {
            keyId: {
                type: Number
            },
            publicKey: {
                type: String
            },
            signature: {
                type: String
            }
        },
        preKey: {
            keyId: {
                type: Number
            },
            publicKey: {
                type: String
            }
        }
    }, 
    last_time_connected: { 
        last_time: {
            type: Date
        },
        last_message: {
            type: Buffer
        } 
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

