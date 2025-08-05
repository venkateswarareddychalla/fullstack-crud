import React, { useState, useEffect } from 'react';
import './App.css';

// Use environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const App = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    publication_year: '',
    available_copies: 1,
    total_copies: 1
  });

  // Fetch all books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/books`);
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new book
  const createBook = async (bookData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });
      
      if (!response.ok) throw new Error('Failed to create book');
      
      const newBook = await response.json();
      setBooks([newBook.newBook, ...books]);
      resetForm();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Update book
  const updateBook = async (id, bookData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });
      
      if (!response.ok) throw new Error('Failed to update book');
      
      const updatedBook = await response.json();
      setBooks(books.map(book => book.id === id ? updatedBook : book));
      resetForm();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Delete book
  const deleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete book');
      
      setBooks(books.filter(book => book.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const bookData = {
      ...formData,
      publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
      available_copies: parseInt(formData.available_copies) || 1,
      total_copies: parseInt(formData.total_copies) || 1
    };

    if (editingBook) {
      await updateBook(editingBook.id, bookData);
    } else {
      await createBook(bookData);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      genre: '',
      publication_year: '',
      available_copies: 1,
      total_copies: 1
    });
    setEditingBook(null);
    setShowForm(false);
    setError(null);
  };

  // Edit book
  const handleEdit = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      genre: book.genre || '',
      publication_year: book.publication_year || '',
      available_copies: book.available_copies || 1,
      total_copies: book.total_copies || 1
    });
    setEditingBook(book);
    setShowForm(true);
  };

  // Initialize component
  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) return <div className="loading">Loading books...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Library Management System</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(true)}
        >
          Add New Book
        </button>
      </header>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmit} className="book-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Genre</label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Publication Year</label>
                <input
                  type="number"
                  name="publication_year"
                  value={formData.publication_year}
                  onChange={handleInputChange}
                  min="1000"
                  max="2099"
                />
              </div>
              
              <div className="form-group">
                <label>Available Copies *</label>
                <input
                  type="number"
                  name="available_copies"
                  value={formData.available_copies}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Total Copies *</label>
                <input
                  type="number"
                  name="total_copies"
                  value={formData.total_copies}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="book-list">
        <h2>Book Inventory ({books.length} books)</h2>
        
        {books.length === 0 ? (
          <p className="no-books">No books found. Add your first book!</p>
        ) : (
          <div className="books-grid">
            {books.map(book => (
              <div key={book.id} className="book-card">
                <h3>{book.title}</h3>
                <p><strong>Author:</strong> {book.author}</p>
                {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
                {book.genre && <p><strong>Genre:</strong> {book.genre}</p>}
                {book.publication_year && <p><strong>Year:</strong> {book.publication_year}</p>}
                <p><strong>Available:</strong> {book.available_copies}/{book.total_copies}</p>
                
                <div className="book-actions">
                  <button 
                    className="btn btn-edit" 
                    onClick={() => handleEdit(book)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-delete" 
                    onClick={() => deleteBook(book.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
