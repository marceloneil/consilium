var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');

var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
};

var advisorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true},
  website: String,
  picture: String,
  facebook: String,
  twitter: String,
  linkedin: String,
  address: String,
  phone: String,
  firm: String,
  designation: String,
  ratings: [{
    user: String,
    rating: Number,
    comment: String
  }]
}, schemaOptions);

advisorSchema.virtual('gravatar').get(function() {
  if (!this.get('email')) {
    return 'https://gravatar.com/avatar/?s=200&d=retro';
  }
  var md5 = crypto.createHash('md5').update(this.get('email')).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';
});

var Advisor = mongoose.model('Advisor', advisorSchema);

module.exports = Advisor;
