/* eslint-disable import/extensions */
/* const formulario = document.querySelector('#form-login'); */
import verifica from './verifica.js';

// eslint-disable-next-line no-undef
const inputs = document.querySelectorAll('[data-tipo]');

inputs.forEach((element) => {
	if (element.id === 'email') {
		element.addEventListener('blur', () => {
			verifica(element);
		});
	}
});
