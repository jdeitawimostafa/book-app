'use strict';


const dotenv = require ('dotenv').config();

const express = require ('express');

const cors = require ('cors');

const superagent = require ('superagent');

const server = express();

const PORT = process.env.PORT || 5000 ;

server.use(express.urlencoded({extended:true}));

server.use(express.static('./public'));

server.set('view engine','ejs');

server.get('/',(req,res) => {
  res.render('pages/index');
});

server.get('/searches/new',(req,res)=>{
  
  res.render('pages/searches/new');
});

server.post('/searches',(req,res) => {
  let booksArray = [];
  let bookName = req.body.search;
  let searchBy = req.body.checks;
  console.log(req.body);
  // let titleUrl = `https://www.googleapis.com/books/v1/volumes?q=${bookName}+intitle` ;
  // let authorUrl = `https://www.googleapis.com/books/v1/volumes?q=${bookName}+inauthour`;
  let url = `https://www.googleapis.com/books/v1/volumes?q=+${searchBy}:${bookName}`;

  superagent.get(url)
    .then(booksData => {
      let gettedData = booksData.body.items;
      console.log(gettedData);
      gettedData.forEach(val => {
        let newBook =  new Book (val);
        booksArray.push(newBook);
      });
      // console.log(booksArray);
      res.render('pages/searches/show',{booksArr:booksArray});
    });
});


function Book (data) {
  this.title = data.volumeInfo.title;
  this.image = (data.volumeInfo.imageLinks) ? data.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg' ;
  this.description = data.volumeInfo.description ? data.volumeInfo.description : 'No descroption for this book' ;
  this.author = data.volumeInfo.authors;
}

server.listen(PORT,()=>{
  console.log(`listening to port ${PORT}`);
});

