'use strict';


const dotenv = require ('dotenv').config();

const express = require ('express');

const cors = require ('cors');

const superagent = require ('superagent');

const server = express();

const pg = require ('pg');

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DEV_MODE ? false : { rejectUnauthorized: false },
});

const PORT = process.env.PORT || 5000 ;

server.use(express.urlencoded({extended:true}));

server.use(express.static('./public'));

server.set('view engine','ejs');

server.get('/',(req,res) => {

  let sql = 'select * from books ';
  client.query(sql)
    .then(booksData => {
      // console.log(booksData);
      res.render('pages/index',{booksArrData:booksData.rows});
    });
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

// server.get('/bookdetails/:bookID',(req,res)=>{

//   res.render('pages/books/detail');
// });


server.get('/details/:bookID',(req,res) => {
  let sql = 'select * from books where id=$1';
  let safeValues = [req.params.bookID];
  client.query(sql,safeValues)
    .then(results => {
      res.render('pages/books/detail',{bookdetail:results.rows});
    });
});

server.post('/books',(req,res) => {
  let sql = 'insert into books (author, title, isbn, image_url, description) values ($1,$2,$3,$4,$5) returning *';
  let {author, title, isbn, image_url, description} = req.body;
  let safeValues = [author, title, isbn, image_url, description];
  client.query(sql,safeValues)
    .then(results => {
      res.redirect(`/pages/books/detail/${results.rows[0].id}`);
    });
  // res.send('hello');
});


function Book (data) {
  this.title = data.volumeInfo.title;
  this.image_url = (data.volumeInfo.imageLinks) ? data.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg' ;
  this.description = data.volumeInfo.description ? data.volumeInfo.description : 'No descroption for this book' ;
  this.author = data.volumeInfo.authors;
  this.isbn = data.volumeInfo.industryIdentifiers.type;
}
client.connect()
  .then(() => {
    server.listen(PORT,()=>{
      console.log(`listening to port ${PORT}`);
    });
  });

