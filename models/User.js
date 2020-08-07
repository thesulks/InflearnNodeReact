const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  }, 
  email: {
    type: String,
    trim: true,
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {
    type: Number,
    default: 0  // 1: admin
  },
  image: String,  // 이렇게만 해도 정의 가능
  token: {  // 유효성 관리
    type: String
  },
  tokenExp: { // 토큰 유효기간
    type: Number
  }
});

const User = mongoose.model('User', userSchema);

module.exports = { User };