import $ from '../js-common-components/dollar';
import { debounce } from '../js-common-components/utils';

function clearResults(select) {
  const emptySearchResults = select;
  emptySearchResults.classList.remove('is-expanded');
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }
}

function createListElement(result) {
  const opt = document.createElement('li');
  const link = document.createElement('a');
  link.setAttribute('href', result.url);
  link.textContent = result.label;
  opt.appendChild(link);
  return opt;
}

function fetchResults(select) {
  fetch('/assets/data/search_results.json')
    .catch(() => '{ results: [] }')
    .then(res => res.json())
    .then((searchResults) => {
      const results = searchResults.results;
      const elements = results.map(createListElement);
      window.requestAnimationFrame(() => {
        clearResults(select);
        select.classList.add('expandable', 'is-expanded');
        elements
          .forEach((el) => select.appendChild(el));
      });
    });
}

const initData = () => {
  $('.js-search').forEach(el => {
    const ul = el.parentNode.appendChild(document.createElement('ul'));
    ul.classList.add('search__results', 'expandable');
    el.addEventListener('keyup', debounce(() => {
      fetchResults(ul);
    }, 150));
    el.addEventListener('blur', () => {
      clearResults(ul);
    });
  });
};

initData();
