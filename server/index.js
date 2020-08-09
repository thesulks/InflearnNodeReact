const express = require("express");
const app = express();

const bodyParser = require("body-parser");
// Content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Content-type: application/json
app.use(bodyParser.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const mongoose = require("mongoose");
const config = require("./config/key.js");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("NongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello, World!"));

const { User } = require("./models/User.js");
// 회원 가입을 위한 route
app.post("/api/users/register", (req, res) => {
  const user = new User(req.body); // body-parser 사용했기 때문에 req.body 가능
  // user model에 저장
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  // 1. 요청된 이메일을 데이터베이스에서 찾음
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    // 2. 비밀번호 일치하는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      }

      // 3. 성공: 토큰 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        // 토큰 저장: 쿠키 vs.로컬스토리지 vs. 세션
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

const { auth } = require("./middleware/auth.js");

app.get("/api/users/auth", auth, (req, res) => {
  // 미틀웨어를 통과해 왔다 == Authentication이 true
  res.status(200).json({
    _id: req.user._id,
    // 현재: role 1 어드민
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.get("/api/hello", (req, res) => {
  res.send("안녕하세요");
});

const port = 5000;
app.listen(port, () => console.log(`listening ${port}...`));
