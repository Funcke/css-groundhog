import $ from '../js-common-components/dollar';

function colorRangeInput() {
  this.min = this.min || 0;
  this.max = this.max || 100;

  const currentValue = ((this.value - this.min) / (this.max - this.min)) * 100;
  this.style.backgroundImage =
  `linear-gradient(to right, #00a1b2 0%, #00a1b2 ${currentValue}%,
  #ccc ${currentValue}%, #ccc 100%)`;
}

const init = () => {
  $('input[type=range]').forEach(el => {
    if (!el.getAttribute('data-initialized')) {
      el.addEventListener('change', colorRangeInput);
      el.addEventListener('mousemove', colorRangeInput);
      el.setAttribute('data-initialized', true);
    }
  });
};

init();
