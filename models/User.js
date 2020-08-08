const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0, // 1: admin
  },
  image: String, // 이렇게만 해도 정의 가능
  token: {
    // 유효성 관리
    type: String,
  },
  tokenExp: {
    // 토큰 유효기간
    type: Number,
  },
});

// 'save'전에 할 작업을 정의
userSchema.pre("save", function (next) {
  // https://docs.mongodb.com/manual/core/document/
  // https://mongoosejs.com/docs/middleware.html
  const user = this;
  if (user.isModified("password")) {
    // 비밀번호 암호화
    bcrypt.genSalt(saltRounds, function (err, salt) {
      // console.log(err, salt);
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        // console.log(err, hash);
        if (err) return next(err);
        user.password = hash;
        next(); // 이제 'save'
      });
    });
  } else {
    next();
  }
});

// 사용자 정의 메서드
userSchema.methods.comparePassword = function (plainPassword, callback) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

userSchema.methods.generateToken = function (callback) {
  const user = this;
  // jsonwebtoken을 이용해서 토큰 생성
  const token = jwt.sign(user._id.toHexString(), "secretToken");
  user.token = token;
  user.save(function (err, user) {
    if (err) return callback(err);
    callback(null, user);
  });
};

userSchema.statics.findByToken = function (token, callback) {
  const user = this;

  jwt.verify(token, "secretToken", function (err, decoded) {
    // 유저 아이디를 이용해서 유저를 찾은 다음
    // 클라이언트에서 가져온 토큰과 디비의 토큰이 일치하는지 확인
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return callback(err);
      callback(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
