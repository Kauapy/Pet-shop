export function valida(input){
    const tipoDeInput = input.dataset.tipo;

    if(validadores[tipoDeInput]){
        validadores[tipoDeInput](input)
    }

    if(input.validity.valid){
        input.parentElement.classList.remove("input-container--invalido");
        input.parentElement.querySelector(".input-mensagem-erro").textContent =""
    }else{
        input.parentElement.classList.add("input-container--invalido");
        input.parentElement.querySelector(".input-mensagem-erro").textContent = mostraMensagemDeErro(tipoDeInput, input)
    }
}

const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

const mensagensDeErro = {
    nome: {
        valueMissing: "O campo de nome não pode estar vazio",
    },
    email: {
        valueMissing: "O campo de email não pode estar vazio",
        typeMismatch: "O email digitado não é válido"
    },
    senha: {
        valueMissing: "O campo de senha não pode estar vazio",
        patternMismatch: "A senha deve conter entre 6 a 12 caracteres, deve conter pelo o menos uma letra maiúscula, um número  e não deve conter símbolos"
    },
    dataNascimento: {
        valueMissing: "O campo de data de nascimento não pode estar vazio",
        customError: "Você deve ser maior que 18 anos para se cadastrar."
    },

    cpf: {
        valueMissing: 'O campo de CPF não pode estar vazio.',
        customError: 'O CPF digitado não é válido.'
    },

    cep: {
        valueMissing: 'O campo de CEP não pode estar vazio.',
        patternMismatch: 'O CEP digitado não é válido.',
        customError: 'Não foi possível buscar o CEP.'
    },

    logradouro: {
        valueMissing: 'O campo de logradouro não pode estar vazio.'
    },

    cidade: {
        valueMissing: 'O campo de cidade não pode estar vazio.'
    },

    estado: {
        valueMissing: 'O campo de estado não pode estar vazio.'
    }, 

    preco: {
        valueMissing: 'O campo de preço não pode estar vazio.',
        patternMismatch: "O preço deve estar no formato correto (ex: 10.99)."
    }
}

const validadores = {
    dataNascimento:input => validaDataNascimento(input),
    cpf:input => validaCPF(input),
    cep:input =>  recuperarCEP(input),
    preco:input => validaPreco(input)
    
}

function mostraMensagemDeErro(tipoDeInput, input) {
    let mensagem = ""
    tiposDeErro.forEach(erro => {
        if(input.validity[erro] && mensagensDeErro[tipoDeInput] && mensagensDeErro[tipoDeInput][erro]) {
            mensagem = mensagensDeErro[tipoDeInput][erro]
        }
    })
    return mensagem
}


function validaDataNascimento(input){
    const dataRecebida = new Date(input.value);

    let mensagem = '';

    if(!maiorDeIdade(dataRecebida)){
        mensagem = "Você deve ser maior que 18 anos para se cadastrar.";
    }

    input.setCustomValidity(mensagem);
}

function maiorDeIdade(data){
    const dataAtual = new Date();
    const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate());

    return dataMais18 <= dataAtual
}

function validaCPF(input){
    const cpfFormatado = input.value.replace(/\D/g, '')
    let mensagem = ''

    if(!checaCPFRepetido(cpfFormatado) || !checaEstruturaCPF(cpfFormatado)){
        mensagem = "O cpf digitado não é válido."
    }

    input.setCustomValidity(mensagem)
}

function checaCPFRepetido(cpf){
    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]
    

    if(valoresRepetidos.includes(cpf)){
        return false
    }

    return true
}

function checaEstruturaCPF(cpf){
    const multiplicador = 10

    return checaDigitoVerificador(cpf, multiplicador)
}

function checaDigitoVerificador(cpf, multiplicador){

    if(multiplicador >= 12){
        return true
    }

    let multiplicadorInicial = multiplicador
    let soma = 0
    const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split('')
    const digitoVerificador = cpf.charAt(multiplicador - 1)
    for(let contador = 0; multiplicadorInicial > 1; multiplicadorInicial -- ){
        soma+= cpfSemDigitos[contador] * multiplicadorInicial
        contador++
    }

    if(digitoVerificador == confirmaDigito(soma)){
        return checaDigitoVerificador(cpf, multiplicador + 1)
    }
    return false
}


function confirmaDigito(soma){
    return 11 - (soma % 11)
}

function recuperarCEP(input){
    const cep = input.value.replace(/\D/g, '')
    const url = `https://viacep.com.br/ws/${cep}/json/`
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'content-type': 'application/json;charset=utf-8'
        }
    }

    if(!input.validity.patternMismatch && !input.validity.valueMissing){
        fetch(url, options).then(
            Response => Response.json()
        ).then(
            data => {
                if(data.errro){
                    input.setCustomValidity("Não foi possível buscar o CEP")
                    return
                }
                input.setCustomValidity('')
                preencheCamposComCEP(data)
                return
            }
        )
    }
}


function preencheCamposComCEP(data){
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')
    const estado = document.querySelector('[data-tipo="estado"]')


    logradouro.value = data.logradouro
    cidade.value = data.localidade
    estado.value = data.uf
    
}


function validaPreco(input) {
    if (input.value.trim() === "") {
        input.setCustomValidity("O campo de preço não pode estar vazio.");
    } else {
        input.setCustomValidity("");
    }
}
