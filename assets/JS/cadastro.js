/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import verificaSenha from './senha.js';

const formulario = document.querySelector('#formulario-cadastro');
const inputsForm = document.querySelectorAll('[data-inputsCadastro]');
const spanErro = document.querySelectorAll('.error');
console.log(spanErro);

const inputVazio = (elemento, datainput) => {
	const erroVazio = document.querySelector(`[${datainput}]`);
	if (elemento.validity.valueMissing) {
		erroVazio.classList.add('erroAtivo');
		erroVazio.innerHTML = 'Campo não pode estar vazio';
	}
	if (elemento.validity.patternMismatch) {
		erroVazio.classList.add('erroAtivo');
		erroVazio.innerHTML = 'Por favor, digite e-mail no formato válido';
	}
};

const verificaId = (elemento) => {
	elemento.id === 'email' ? inputVazio(elemento, 'data-erro-email') : '';
	elemento.id === 'nome' ? inputVazio(elemento, 'data-erro-nome') : '';
	elemento.id === 'senha' ? inputVazio(elemento, 'data-erro-senha') : '';
	elemento.id === 'senhaConfirm'
		? inputVazio(elemento, 'data-erro-confirmaSenha')
		: '';
};

// comecar aqui
inputsForm.forEach((elements) => {
	elements.addEventListener('blur', () => {
		verificaId(elements);
	});

	elements.addEventListener('focus', () => {
		// TODO limpar os spans do input quando estiver em foco
	});
});

formulario.addEventListener('submit', (ev) => {
	ev.preventDefault();

	verificaSenha();
});
