const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserToken = new Schema({
    access_token:{type:String},
    scope:{type:String},
    token_type:{type:String},
    expiry_date:{type:Date}
})
module.exports = mongoose.model('UserToken',UserToken)