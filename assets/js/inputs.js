/* eslint-disable no-undef */
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

const limparInputs = (elementos, datainput) => {
	const erroVazio = document.querySelector(`[${datainput}]`);
	if (elementos.validity.valueMissing) {
		erroVazio.classList.remove('erroAtivo');
		erroVazio.innerHTML = '';
	}
	if (elementos.validity.patternMismatch) {
		erroVazio.classList.remove('erroAtivo');
		erroVazio.innerHTML = '';
	}
};

export { limparInputs, inputVazio };
