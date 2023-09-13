'use strict';

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  comments: [String]
});

const Book = mongoose.model('books', bookSchema);

//create, read, update, delete

const createBook = async (book) => {
  try {
    return await book.save();
  } catch (err) {
    throw err; 
  }
};

const readBook = async (id) => {
  try {
    return await Book.findById(id);
  } catch (err) {
    throw err;
  }
};

const readAllBooks = async () => {
  try {
    return await Book.find( {} );
  } catch (err) {
    throw err;
  }
};

const updateBook = async (id, comment) => {
  try {
    return await Book.updateOne(
      { _id : id },
      { $push: {comments: comment} }
    );
  } catch (err) {
    throw err;
  }
};

const deleteBook = async (id) => {
  try {
    const res = await Book.deleteOne({_id: id});
    return (res.deletedCount == 1); 
  } catch (err) {
    throw err;
  }
};

const deleteAllBooks = async () => {
  try {
    await Book.deleteMany({});
    return true; 
  } catch (err) {
    throw err;
  }
};


module.exports = function (app, db) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const books = await readAllBooks();

      res.json(books.map( book => {
        const commentcount = book.comments.length; 
        return {...book.toObject(), commentcount};
      }));
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        res.send("missing required field title");
      } else {
        const book = await createBook(new Book( {
          title: title,
          comments: []
        }));
        res.json(book);
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      if (deleteAllBooks()) {
        res.send("complete delete successful");
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      const book = await readBook(bookid);
      if (book) {
        res.json(book);
      } else {
        res.send("no book exists");
      }
      
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      const book = await readBook(bookid); 
      if (!book) {
        res.send("no book exists");
      }
      else if (!comment) {
        res.send("missing required field comment");
      } else {
        await updateBook(bookid, comment);
        res.json(await readBook(bookid));
      }
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      if (await deleteBook(bookid)) {
        res.send("delete successful");
      } else {
        res.send("no book exists"); 
      }
    });
  
};
