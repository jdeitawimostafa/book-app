'use strict';


const dotenv = require ('dotenv').config();

const express = require ('express');

const cors = require ('cors');

const superagent = require ('superagent');

const server = express();

const PORT = process.env.PORT || 5000 ;

server.use(express.static('./public'));

server.set('view engine','ejs');

server.get('/',(req,res) => {
  res.render('pages/index');
});

server.get('/searches',(req,res) => {
  let booksArray = [];
  let url;
  let bookName = req.query.booksName;
  let titleUrl = `https://www.googleapis.com/books/v1/volumes?q=${bookName}+intitle` ;
  let authorUrl = `https://www.googleapis.com/books/v1/volumes?q=${bookName}+inauthour`;
  if (req.query.checks === 'title'){ url = titleUrl;}
  else if(req.query.checks === 'author') { url = authorUrl;}
  superagent.get(url)
    .then(booksData => {
      let gettedData = booksData.body.items;
      gettedData.forEach(val => {
        let newBook =  new Book (val);
        booksArray.push(newBook);
      });
      res.render('pages/searches/show',{booksArr:booksArray});
    });
});


function Book (data) {
  this.title = data.volumeInfo.title;
  this.image = data.volumeInfo.imageLinks.thumbnail;
  this.description = data.volumeInfo.description;
  this.author = data.volumeInfo.authors;
}

server.listen(PORT,()=>{
  console.log(`listening to port ${PORT}`);
});

