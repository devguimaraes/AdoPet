/* eslint-disable no-undef */
/* eslint-disable import/extensions */
/* const formulario = document.querySelector('#form-login'); */
import { verifica, limparInput } from './verifica.js';
import autenticaUsuario from './autenticacaoUser.js';

const formulario = document.querySelector('#form-login');

// eslint-disable-next-line no-undef
const inputs = document.querySelectorAll('[data-tipo]');

inputs.forEach((element) => {
	if (element.id === 'email') {
		element.addEventListener('blur', () => {
			verifica(element);
		});
	}
	if (element.id === 'email') {
		element.addEventListener('focus', () => {
			limparInput(element);
		});
	}
});

formulario.addEventListener('submit', (el) => {
	el.preventDefault();
	autenticaUsuario(el);
});
