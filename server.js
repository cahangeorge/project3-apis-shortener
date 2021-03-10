require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortid = require('shortid');
const dns = require('dns');
const url = require('url');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () => {
  console.log('connected');
  console.log(mongoose.connection.readyState); //logs 1
});

let schema = new mongoose.Schema({
  original_url: {type: String, required: true},
  short_url: {type: String, required: true}
});
let User = mongoose.model('User', schema);


// Your first API endpoint
app.post('/api/shorturl/new', function(req, res) {
  let userReq = req.body.url;
  let id = shortid.generate();
  let userURL = url.parse(userReq);

  dns.lookup(userURL.hostname, (error, address, family) => {
    if(!userURL.hostname){
      res.json({error: "invalid url"});
    } else {
      User.create({
        original_url: userReq, 
        short_url: id
      });

      res.json({
        original_url: userReq, 
        short_url: id
      });
    }
  });
});

app.get('/api/shorturl/:input', (req, res) => {
  let input = req.params.input;

  User.findOne({short_url: input}, (err, result) => {
    if(err){
      res.json('URL not found');
    } else {
      res.redirect(result.original_url);
      console.log(result.original_url);
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
