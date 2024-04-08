import xml2js from 'xml2js'
import asyncForEach from './helpers/asyncForEach'

// Classes
class Book {
  constructor(data) {

    const {isbn, title, author, publisher, date, country, pages} = data

    this.isbn = isbn
    this.title = title
    this.author = author
    this.publisher = publisher
    this.date = date
    this.country = country
    this.pages = pages
  }
}


// Methods
export default async function(isbn) {
  if (!isbn) return

  const openLibraryData = await fetchOpenLibrary(isbn)

  if (openLibraryData.book) {
    return openLibraryData
  } else {
    /* const bnpData = await fetchBnp(isbn)
    if (bnpData.book) {
      return bnpData
    } */
  }

  return {
    book: null,
    bookError: 'notfound',
  }
}

async function fetchOpenLibrary(isbn) {

  if (!isbn) return

  let book = null

  const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`)
  const data = response.ok && await response.json()

  if (data && !data.error) {

    const authors = []
    await asyncForEach(data.authors, async (author) => {
      const authorName = await fetchOpenLibraryAuthor(author.key)
      authors.push(authorName)
    })

    book = new Book({
      isbn,
      title: data.title,
      author: authors.join(', '),
      publisher: data.publishers.join(', '),
      date: data.publish_date,
      country: data.publish_country,
      pages: data.number_of_pages,
    })
  }

  return {
    book,
    bookError: !data || data.error,
  }
}
async function fetchOpenLibraryAuthor(key) {
  if (!key) return
  const response = await fetch(`https://openlibrary.org${key}.json`)
  const data = response.ok && await response.json()

  return data.name
}

async function fetchBnp(isbn) {

  if (!isbn) return

  let book = null

  const response = await fetch(`http://urn.bn.pt/isbn/mods/xml?id=${isbn}`, {
    mode: 'no-cors'
  })
  const content = response.ok && await response.text()
  const parser = new xml2js.Parser()
  const data = parser.parseStringPromise(content)

  if (data && !data.error) {
    book = new Book({
      isbn: data.isbn_13[0],
      title: data.full_title,
      author: data.author.name,
      publisher: data.publishers[0],
      date: data.publish_date,
      country: data.publish_country,
      pages: data.number_of_pages,
    })
  }

  return {
    book,
    bookError: !data || data.error,
  }
}
