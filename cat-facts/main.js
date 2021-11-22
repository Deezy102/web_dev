"use strict";
function createUpvotesElement(num) {
    let upvotesElement = document.createElement('div');
    upvotesElement.classList.add('upvotes');
    upvotesElement.textContent = num;
    return upvotesElement;
}

function createAuthorElement(user) {
    user = user || {name : { first:'', last: ''}};
    let authorElement = document.createElement('div');
    authorElement.classList.add('author-name');
    authorElement.textContent = user.name.first + ' ' + user.name.last;
    return authorElement;
}

function createFooterElement(record) {
    let footerElement = document.createElement('footer');
    footerElement.classList.add('item-footer');
    footerElement.append(createAuthorElement(record.user));
    footerElement.append(createUpvotesElement(record.upvotes));
    return footerElement;
}

function createContentElement(record) {
    let contentElement = document.createElement('div');
    contentElement.classList.add('item-content');
    contentElement.innerHTML = record.text;
    return contentElement;
}

function createListItemElement(record) {
    let itemElement = document.createElement('div');
    itemElement.classList.add('facts-list-item');
    itemElement.append(createContentElement(record));
    itemElement.append(createFooterElement(record));
    return itemElement; 
}

function renderRecords(records) {
    let factsList = document.querySelector('.facts-list');
    factsList.innerHTML = '';
    for (let record of records) {
        factsList.append(createListItemElement(record));
    }
}

function setPaginationInfo(info) {
    document.querySelector('.total-count').innerHTML = info.total_count;
    let start = info.total_count > 0 ? (info.current_page - 1) * info.per_page + 1 : 0;
    document.querySelector('.current-interval-start').innerHTML = start;
    let end = Math.min(info.total_count, start + info.per_page - 1);
    document.querySelector('.current-interval-end').innerHTML = end;
} 

function createPageBtn(page, classes=[]) {
    let btn = document.createElement('button');
    classes.push('btn');
    btn.classList.add(...classes);
    btn.dataset.page = page;
    btn.innerHTML = page;
    return btn;
}

function renderPaginationElement(info) {
    let btn;
    let paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    if (info.total_count == 0) 
        return;
    
    btn = createPageBtn(1, ['first-page-btn']);
    btn.innerHTML = 'Первая страница';
    if (info.current_page == 1) {
        btn.style.visibility = 'hiden';
    }
    paginationContainer.append(btn);
    
    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    let start = Math.max(info.current_page - 2, 1);
    let end = Math.min(info.current_page + 2, info.total_pages);
    for (let i = start; i <=end; i++) {
        buttonsContainer.append(createPageBtn(i, i == info.current_page ? ['active'] : []));
    }

    btn = createPageBtn(info.total_pages, ['last-page-btn']);
    btn.innerHTML = 'Последняя страница';
    if (info.current_page == info.total_pages) {
        btn.style.visibility = 'hiden';
    }
    paginationContainer.append(btn);
}

function downloadData(page=1, searchQuery='') {
    let factsList = document.querySelector('.facts-list');
    let perPage = document.querySelector('.per-page-btn').value;
    let url = new URL(factsList.dataset.url);
    if (searchQuery != '') {
        url.searchParams.append('q', searchQuery);
    } 
    url.searchParams.append('page', page);
    url.searchParams.append('per-page', perPage);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url)
    xhr.responseType = 'json';
    xhr.onload = function () {
        renderRecords(this.response.records);
        setPaginationInfo(this.response['_pagination']);
        renderPaginationElement(this.response['_pagination']);
    }
    xhr.send();
}

function autocompleteElementHandler(event) {
    document.querySelector('#search-field').value = event.target.innerHTML;
    document.querySelector('.autocomplete').innerHTML = '';
}

function createAutocompleteElement(valueOfElem) {
    let elem = document.createElement('div');
    elem.classList.add('ac-elem');
    elem.innerHTML = valueOfElem;
    elem.onclick = autocompleteElementHandler;
    return elem;
}

function renderAutocompleteElement(arrAutocomplete) {
    let autocompleteElementContainer = document.querySelector('.autocomplete');
    autocompleteElementContainer.innerHTML = '';
    for (let elem of arrAutocomplete) {
        autocompleteElementContainer.append(createAutocompleteElement(elem));
    }
}

function autocompleteSearchQuery() {
    let url = new URL('http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete');
    url.searchParams.append('q', document.querySelector('#search-field').value);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url)
    xhr.responseType = 'json';
    xhr.onload = function () {
        renderAutocompleteElement(this.response);
    }
    xhr.send();

}

function pageBtnHandler(event) {
    if (event.target.dataset.page) {
        downloadData(event.target.dataset.page, document.querySelector('#search-field').value);
        window.scrollTo(0, 0);
    }
}

function perPageBtnHandler(event) {
    downloadData(1, document.querySelector('#search-field').value);
}



function searchFieldHandler() {
    autocompleteSearchQuery();
}

function searchBtnHandler() {
    if (document.querySelector('.autocomplete').innerHTML =! ''){
        document.querySelector('.autocomplete').innerHTML = '';
    }
    downloadData(1, document.querySelector('#search-field').value);
}

window.onload = function () {
    downloadData();
    document.querySelector('.pagination').onclick = pageBtnHandler;
    document.querySelector('.per-page-btn').onchange = perPageBtnHandler;
    document.querySelector('#search-field').oninput = searchFieldHandler; 
    document.querySelector('.search-btn').onclick = searchBtnHandler;
}

