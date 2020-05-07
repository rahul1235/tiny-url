const express = require('express');
const app = express();
const mongoose = require('mongoose');
const shortUrlModel = require('./models/shortUrl');

app.use(express.urlencoded({ extended: false }));
mongoose.connect('mongodb://localhost/urlShortner', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.set('view engine', 'ejs');

app.listen(process.env.PORT || 5000);
app.get('/', async (req, res) => {
    await shortUrlModel.deleteOne({short:'YoJb9adBr'});
    const shortUrls = await shortUrlModel.find();
    res.render('index', { shortUrls })
});

app.get('/:shortUrl', async (req, res) => {
    const {shortUrl} = req.params;
    const shortUrlData = await shortUrlModel.findOne({
        short: req.params.shortUrl
    });
    if(!shortUrlData){
        return res.status(400).send('No Data found')
    }
    shortUrlData.clicks += 1;
    shortUrlData.save();
    res.redirect(shortUrlData.full)
});

app.post('/shortUrls', async (req, res) => {
    console.log(req.body.fullUrl);
    await shortUrlModel.create({
        full: req.body.fullUrl
    });
    // res.send(req.body);
    res.redirect('/');
});
