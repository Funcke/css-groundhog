import $ from '../js-common-components/dollar';


function dateFieldChangeHandler() {
  if (isNaN(this.value)) {
    this.classList.remove('inputfield--date--placeholder');
    this.classList.add('inputfield--date');
  } else {
    this.classList.remove('inputfield--date');
    this.classList.add('inputfield--date--placeholder');
  }
}


const validateDate = () => {
  $('input[type=date]').forEach(el => {
    if (!el.getAttribute('data-initialized')) {
      el.addEventListener('keyup', dateFieldChangeHandler);
      el.setAttribute('data-initialized', true);
    }
  });
};


validateDate();
