const express = require('express');
const mongoose = require('mongoose');
const url = require('url');
const shortUrlModel = require('./models/shortUrl');
require('dotenv').config();


const app = express();

const {
  DB_NAME, DB_HOST, PORT, DB_PASS, DB_USER,
} = process.env;

app.use(express.urlencoded({ extended: true }));


mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err) => {
  if (err) throw err;
  // eslint-disable-next-line no-console
  console.log('DB Connected Successfully');
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.log(err);
});

app.set('view engine', 'ejs');

app.listen(PORT || 5000);

// get all routes WIP
// const routes = app._router.stack.filter((r) => {
//   if (!r.route) {
//     return false;
//   }
//   return (r.route).path;
// }).map((r) => r.route.path);


app.get('/', async (req, res) => {
  const shortUrls = await shortUrlModel.find();
  res.render('pages/index', {
    shortUrls,
    //  routes
  });
});


app.get('/shortUrls/:shortUrl', async (req, res) => {
  const shortUrlData = await shortUrlModel.findOne({
    short: req.params.shortUrl,
  });
  if (!shortUrlData) {
    return res.status(400).send('No Data found');
  }
  shortUrlData.clicks += 1;
  shortUrlData.save();
  return res.redirect(shortUrlData.full);
});

app.post('/shortUrls', async (req, res) => {
  const { fullUrl } = req.body;
  // validate if url is valid
  if (!(url.parse(fullUrl)).host) {
    res.redirect('/');
  }
  // check if url exists into db
  const shortUrlData = await shortUrlModel.findOne({
    full: req.body.fullUrl,
  });
  // if url is not into db then create
  if (!shortUrlData) {
    await shortUrlModel.create({
      full: req.body.fullUrl,
    });
  }
  res.redirect('/');
});
