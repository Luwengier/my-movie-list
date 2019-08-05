(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []
  const dataPanel = document.getElementById('data-panel')
  const dataTable = document.getElementById('data-table')
  const dataListener = document.getElementById('data-listener')
  const switchBar = document.getElementById('switch-bar')
  const pagination = document.getElementById('pagination')
  const listPanel = document.getElementById('list-panel')
  const ITEM_PER_PAGE = 12
  let paginationData = []
  let displayStyle = true
  let pageNum = 1
  const listName = {
    "1": "Action",
    "2": "Adventure",
    "3": "Animation",
    "4": "Comedy",
    "5": "Crime",
    "6": "Documentary",
    "7": "Drama",
    "8": "Family",
    "9": "Fantasy",
    "10": "History",
    "11": "Horror",
    "12": "Music",
    "13": "Mystery",
    "14": "Romance",
    "15": "Science Fiction",
    "16": "TV Movie",
    "17": "Thriller",
    "18": "War",
    "19": "Western"
  }

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    console.log(data)
    //displayDataList(data)
    getTotalPages(data)
    getPageData(1, data)
  }).catch((err) => console.log(err))

  //list nav
  displayList()

  //listen to switch bar
  switchBar.addEventListener('click', (event) => {
    if (event.target.matches('.th')) {
      displayStyle = true
    } else {
      displayStyle = false
    }
    console.log(displayStyle)
    getTotalPages(results || data)
    getPageData(pageNum, results || data)
  })

  //listen to data panel
  dataListener.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')

  //listen to tag panel
  listPanel.addEventListener('click', (event) => {
    pageNum = 1
    if (event.target.matches('.list-group-item')) {
      results = data.filter(movie => movie.genres.includes(Number(event.target.dataset.tagnum)))
      console.log(results)
      getTotalPages(results)
      getPageData(pageNum, results)
    }
  })


  // listen to search form submit event
  searchForm.addEventListener('submit', event => {
    event.preventDefault()

    let results = []
    const regex = new RegExp(searchInput.value, 'i')

    results = data.filter(movie => movie.title.match(regex))
    console.log(results)
    // displayDataList(results)
    getTotalPages(results)
    getPageData(1, results)
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
      pageNum = event.target.dataset.page
    }
  })


  function displayDataList(data) {
    let htmlContent = ''
    if (displayStyle) {
      dataTable.innerHTML = ''
      data.forEach(function (item, index) {
        let tagContent = ''
        item.genres.forEach(function (num) {
          tagContent += `
          <span class="badge badge-light font-weight-light">${listName[num]}</span>
          `
        })
        htmlContent += `
        <div class="col-sm-3 pr-0">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${item.title}</h5>
            </div>
            <div class="tagfield">${tagContent}</div>
            <div class="card-footer">
              <!-- "More" button -->
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!-- favorite button -->
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `

      })
      dataPanel.innerHTML = htmlContent
    } else {
      dataPanel.innerHTML = ''
      data.forEach(function (item, index) {
        let tagContent = ''
        item.genres.forEach(function (num) {
          tagContent += `
          <span class="badge badge-light font-weight-light">${listName[num]}</span>
          `
        })
        htmlContent += `
        <tr>
          <td>
            <div>
             <h6 class="card-title">${item.title}</h5>
            </div>
            <div class="tagfield">${tagContent}</div>
          </td>
          <td>
            <div>
              <!-- "More" button -->
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!-- favorite button -->
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </td>
        </tr>
        `
      })
      dataTable.innerHTML = htmlContent
    }
  }

  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id
    console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1} </a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }

  function displayList() {
    let htmlContent = ''
    for (let item in listName) {
      htmlContent += `
      <button class="list-group-item list-group-item-action" data-tagnum = ${item} data-toggle="list">${listName[item]}</button>
      `
    }
    listPanel.innerHTML = htmlContent
  }



})()