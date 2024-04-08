import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/input/input.js'
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js'

import getBook from './js/getBook.js'

const bookFields = [
  'isbn',
  'title',
  'author',
  'publisher',
  'date',
  'pages',
]


// Elements
const formEl = document.getElementById('form')
const isbnInputEl = document.getElementById('isbn')
const errorEl = document.getElementById('error')
const tableDataEl = document.getElementById('table-data')
const bookDialogEl = document.getElementById('book-dialog')
const closeDialogEl = document.getElementById('close-dialog')
const confirmDialogEl = document.getElementById('confirm-dialog')

// Methods
function hideError() {
  errorEl.classList.remove('is-active')
}
function showError() {
  errorEl.classList.add('is-active')
}

function confirmDialog() {

  const book = localStorage.getItem('book')

  renderTableRow(JSON.parse(book))
  bookDialogEl.hide()
  document.getElementById('table').removeAttribute('hidden')
  localStorage.setItem('book', null)
  isbnInputEl.value = ''
}
function renderTableRow(book) {

  if (!book) return

  const rowTemplate = document.getElementById('row-template')
  const newBook = rowTemplate.content.cloneNode(true)

  const renderTd = (field) => {
    const element = newBook.querySelector(`#book-${field}`)
    if (element) {
      element.textContent = book[field]
    }
  }

  bookFields.forEach(field => {
    renderTd(field)
  })

  tableDataEl.append(newBook)
}

async function renderBook(e) {
  e.preventDefault()

  hideError()

  const isbn = isbnInputEl.value
  const { book, bookError } = await getBook(isbn)

  if (bookError === 'notfound') {
    showError()
    errorEl.textContent = 'Livro não encontrado'
  } else {
    localStorage.setItem('book', JSON.stringify(book))
    openDialog(book)
  }
}

function deleteRow(event) {
  const target = event.target
  const isDeleteButton = target.closest('td').querySelector('#delete-row')
  if (isDeleteButton) {
    if (window.confirm('Tem a certeza que deseja apagar o livro?')) {
      target.closest('tr').remove()
    }
  }
}

function closeDialog() {
  resetBook()
  bookDialogEl.hide()
}
function openDialog(book) {

  const renderField = (field) => {
    const element = bookDialogEl.querySelector(`#dialog-${field}`)
    if (element) {
      element.textContent = book[field]
    }
  }

  bookFields.forEach(field => {
    renderField(field)
  })

  bookDialogEl.show()
}
function resetBook() {
  book = null
}

// Events
formEl.addEventListener('submit', renderBook)
tableDataEl.addEventListener('click', deleteRow)
closeDialogEl.addEventListener('click', closeDialog)
confirmDialogEl.addEventListener('click', confirmDialog)
