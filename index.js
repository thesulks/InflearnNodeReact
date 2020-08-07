const express = require('express');
const app = express();
const port = 5000;

const bodyParser = require('body-parser');
// Content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// Content-type: application/json
app.use(bodyParser.json());

const mongoose = require('mongoose');
const config = require('./config/key.js');
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('NongoDB Connected...'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello, World!'));

const { User } = require('./models/User.js');

// 회원 가입을 위한 route
app.post('/register', (req, res) => {
  const user = new User(req.body);  // body-parser 사용했기 때문에 req.body 가능
  // user model에 저장
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ 
      success: true
    });
  });
});




app.listen(port, () => console.log(`listening ${port}...`));