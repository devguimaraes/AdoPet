/* eslint-disable import/extensions */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import { limparInputs, inputVazio } from './inputs.js';
import verificaSenha from './senha.js';

const formulario = document.querySelector('#formulario-cadastro');
const inputsForm = document.querySelectorAll('[data-inputsCadastro]');

const verificaId = (elemento, funcao) => {
	elemento.id === 'email' ? funcao(elemento, 'data-erro-email') : '';
	elemento.id === 'nome' ? funcao(elemento, 'data-erro-nome') : '';
	elemento.id === 'senha' ? funcao(elemento, 'data-erro-senha') : '';
	elemento.id === 'senhaConfirm'
		? funcao(elemento, 'data-erro-confirmaSenha')
		: '';
};

// comecar aqui
inputsForm.forEach((elements) => {
	elements.addEventListener('blur', () => {
		verificaId(elements, inputVazio);
	});

	elements.addEventListener('focus', () => {
		verificaId(elements, limparInputs);
	});
});

formulario.addEventListener('submit', (ev) => {
	ev.preventDefault();

	verificaSenha();
});
