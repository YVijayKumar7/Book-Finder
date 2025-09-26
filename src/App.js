// src/App.js
import React, { useState } from "react";
import "./App.css";

function BookCard({ doc }) {
  const coverId = doc.cover_i;
  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : null;
  const title = doc.title || "Untitled";
  const author = doc.author_name ? doc.author_name.join(", ") : "Unknown author";
  const year =
    doc.first_publish_year ||
    (Array.isArray(doc.publish_year) && doc.publish_year[0]) ||
    "N/A";
  const workUrl = doc.key ? `https://openlibrary.org${doc.key}` : null;

  const cardContent = (
    <>
      {coverUrl ? (
        <img src={coverUrl} alt={`${title} cover`} className="book-cover" />
      ) : (
        <div className="book-no-image" aria-hidden>
          No Image
        </div>
      )}

      <div className="book-details">
        <div className="book-title">{title}</div>
        <div className="book-author">{author}</div>
        <div className="book-year">{year}</div>
      </div>
    </>
  );

  return workUrl ? (
    <a
      href={workUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="book-item"
      aria-label={`Open ${title} on OpenLibrary`}
    >
      {cardContent}
    </a>
  ) : (
    <div className="book-item" aria-label={title}>
      {cardContent}
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [numFound, setNumFound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setError("Please enter a book title to search.");
      setBooks([]);
      setNumFound(null);
      return;
    }

    setError("");
    setLoading(true);
    setBooks([]);
    setNumFound(null);

    try {
      const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(
        q
      )}&limit=30`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`Network error: ${res.status}`);
      const data = await res.json();

      if (data && Array.isArray(data.docs) && data.docs.length > 0) {
        setBooks(data.docs);
        setNumFound(data.numFound ?? data.docs.length);
      } else {
        setBooks([]);
        setNumFound(0);
        setError("No results found. Try a broader title or fewer words.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch results. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <h1>Book Finder</h1>

      <div className="search-container">
        <form className="search-form" onSubmit={handleSearch}>
          <label htmlFor="search" style={{ display: "none" }}>
            Search books by title
          </label>
          <input
            id="search"
            className="search-input"
            placeholder="Search books by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
      </div>

      {loading ? (
        <p>Loading results…</p>
      ) : (
        <>
          {numFound !== null && (
            <p style={{ marginBottom: 8 }}>
              Showing {books.length} of {numFound.toLocaleString()} result
              {numFound !== 1 ? "s" : ""}
            </p>
          )}

          <div className="book-list">
            {books.map((doc, i) => (
              <BookCard key={doc.key ?? `${doc.title}-${i}`} doc={doc} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
