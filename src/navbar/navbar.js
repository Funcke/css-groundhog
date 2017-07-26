import $ from '../js-common-components/dollar';
import { debounce } from '../js-common-components/utils';
import Promise from 'promise-polyfill';
import 'whatwg-fetch';

function clearResults(select) {
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }
}

function createListElement(result, opts) {
  const opt = document.createElement('li');
  const link = document.createElement('a');
  link.setAttribute('href', result[opts.url]);
  link.textContent = result[opts.title];
  opt.appendChild(link);
  return opt;
}

function fetchResults(select, searchData, params, opts) {
  if (!window.Promise) {
    window.Promise = Promise;
  }

  fetch(`${searchData}?${params}`)
    .catch(() => '{ results: [] }')
    .then(res => res.json())
    .then((searchResults) => {
      const results = searchResults[opts.resultskey];
      if (!results) {
        return;
      }
      const trimmedresults = results.slice(0, opts.maxresults);
      const elements = trimmedresults.map(el => createListElement(el, opts));
      window.requestAnimationFrame(() => {
        clearResults(select);
        elements
          .forEach((el) => select.appendChild(el));
      });
    });
}

const initData = () => {
  $('.js-search:not([action=""])').forEach(el => {
    const form = el.parentNode;
    const ul = form.appendChild(document.createElement('ul'));
    ul.addEventListener('click', (e) => e.stopPropagation());
    const searchData = form.dataset.results || form.action;
    ul.classList.add('search__results');
    const opts = {
      title: form.dataset.titleprop || 'title',
      url: form.dataset.urlprop || 'url',
      maxresults: parseInt(form.dataset.maxresults, 10) || 10,
      resultskey: form.dataset.resultskey || 'results',
    };
    el.addEventListener('keyup', debounce(() => {
      ul.classList.add('has-focus');
      const params = $('input', form)
        .map(input => `${input.name}=${input.value}`)
        .join('&');
      fetchResults(ul, searchData, params, opts);
    }, 150));
    document.body.addEventListener('click', () => {
      ul.classList.remove('has-focus');
    });
  });
};

initData();
