const express = require("express");
const path = require("path");
const cors = require("cors");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");


const app = express();

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://fullstack-crud-theta.vercel.app'] // Update this with your actual Vercel domain
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Use environment variable for database path in production
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'database.db') // Render uses /tmp for writable files
  : path.join(__dirname, "database.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create books table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        isbn TEXT UNIQUE,
        genre TEXT,
        publication_year INTEGER,
        available_copies INTEGER DEFAULT 1,
        total_copies INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server Running on port ${port}`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

// GET all books - Read operation
app.get("/books", async (request, response) => {
  try {
    const getBooksQuery = `
      SELECT * FROM books ORDER BY created_at DESC
    `;
    const books = await db.all(getBooksQuery);
    response.send(books);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// GET single book by ID - Read operation
app.get("/books/:bookId", async (request, response) => {
  try {
    const { bookId } = request.params;
    const getBookQuery = `
      SELECT * FROM books WHERE id = ?
    `;
    const book = await db.get(getBookQuery, [bookId]);
    
    if (!book) {
      return response.status(404).send({ error: "Book not found" });
    }
    
    response.send(book);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// POST create new book - Create operation
app.post("/books", async (request, response) => {
  try {
    const {
      title,
      author,
      isbn,
      genre,
      publication_year,
      available_copies,
      total_copies
    } = request.body;

    if (!title || !author) {
      return response.status(400).send({ error: "Title and author are required" });
    }

    const createBookQuery = `
      INSERT INTO books (
        title, author, isbn, genre, publication_year, 
        available_copies, total_copies
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await db.run(createBookQuery, [
      title,
      author,
      isbn || null,
      genre || null,
      publication_year || null,
      available_copies || 1,
      total_copies || 1
    ]);

    const newBook = await db.get(
      "SELECT * FROM books WHERE id = ?",
      [result.lastID]
    );

    response.status(201).send({newBook, text: "Book created successfully"});
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      response.status(400).send({ error: "ISBN already exists" });
    } else {
      response.status(500).send({ error: error.message });
    }
  }
});

// PUT update book - Update operation
app.put("/books/:bookId", async (request, response) => {
  try {
    const { bookId } = request.params;
    const {
      title,
      author,
      isbn,
      genre,
      publication_year,
      available_copies,
      total_copies
    } = request.body;

    // Check if book exists
    const existingBook = await db.get(
      "SELECT * FROM books WHERE id = ?",
      [bookId]
    );

    if (!existingBook) {
      return response.status(404).send({ error: "Book not found" });
    }

    const updateBookQuery = `
      UPDATE books SET
        title = COALESCE(?, title),
        author = COALESCE(?, author),
        isbn = COALESCE(?, isbn),
        genre = COALESCE(?, genre),
        publication_year = COALESCE(?, publication_year),
        available_copies = COALESCE(?, available_copies),
        total_copies = COALESCE(?, total_copies),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.run(updateBookQuery, [
      title,
      author,
      isbn,
      genre,
      publication_year,
      available_copies,
      total_copies,
      bookId
    ]);

    const updatedBook = await db.get(
      "SELECT * FROM books WHERE id = ?",
      [bookId]
    );

    response.send(updatedBook);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      response.status(400).send({ error: "ISBN already exists" });
    } else {
      response.status(500).send({ error: error.message });
    }
  }
});

// DELETE book - Delete operation
app.delete("/books/:bookId", async (request, response) => {
  try {
    const { bookId } = request.params;

    // Check if book exists
    const existingBook = await db.get(
      "SELECT * FROM books WHERE id = ?",
      [bookId]
    );

    if (!existingBook) {
      return response.status(404).send({ error: "Book not found" });
    }

    const deleteBookQuery = `
      DELETE FROM books WHERE id = ?
    `;

    await db.run(deleteBookQuery, [bookId]);

    response.send({ message: "Book deleted successfully" });
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// Health check endpoint
app.get("/", (request, response) => {
  response.send("Library Store API is running!");
});

initializeDBAndServer();
