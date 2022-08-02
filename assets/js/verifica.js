/* eslint-disable no-undef */
const informaErro = (element) => {
	const error = document.querySelector('[data-error]');
	error.classList = 'error--active';
	error.innerHTML = element;
};

const verifica = (elemento) => {
	if (elemento.validity.valueMissing) {
		informaErro('O campo e-mail precisa ser preenchido');
	}

	if (elemento.validity.patternMismatch) {
		informaErro('Por favor preencher com e-mail válido');
	}
};

const limparInput = (elemento) => {
	const error = document.querySelector('[data-error]');
	if (elemento.validity.valueMissing) {
		error.classList.remove('error--active');
		error.innerHTML = '';
	}
	if (elemento.validity.patternMismatch) {
		error.classList.remove('error--active');
		error.innerHTML = '';
	}
};

export { verifica, limparInput };
