/* const formulario = document.querySelector('#form-login'); */
import verifica from './verifica.js';

const inputs = document.querySelectorAll('[data-tipo]');

inputs.forEach((element) => {
	if (element.id === 'email') {
		element.addEventListener('blur', () => {
			verifica(element);
		});
	}
});
