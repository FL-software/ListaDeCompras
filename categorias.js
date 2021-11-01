'use strict'

// Abertura e Fechamento do pop-up

const abrirModal = () => document.getElementById('modal')
    .classList.add('active')

const fecharModal = () => {
    limparCampos()
    document.getElementById('modal').classList.remove('active')
}

// Leitura e Escrita na variavel local do navegador

const getLocalStorage = () => JSON.parse(localStorage.getItem('db_categorias')) ?? []

const setLocalStorage = (dbCategorias) => localStorage.setItem("db_categorias" , JSON.stringify(dbCategorias))

// CRUD - create read update delete

const criarCategorias = (categorias) => {
    const dbCategorias = getLocalStorage()
    dbCategorias.push(categorias)
    setLocalStorage(dbCategorias)
}

const lerCategorias = () => getLocalStorage()

const atualizarCategorias = (index, categorias) => {
    const dbCategorias = lerCategorias()
    dbCategorias[index] = categorias
    setLocalStorage(dbCategorias)
}

const deleteCategorias = (index) => {
    const dbCategorias = lerCategorias()
    dbCategorias.splice(index, 1)
    setLocalStorage(dbCategorias)
}

//Interação com o Layout

const isValidFields = () => {
    return document.getElementById('form').reportValidity()
}

const limparCampos = () => {
    const fields = document.querySelectorAll('.modal-field')
    fields.forEach(field => field.value = "")
    document.getElementById('nome').dataset.index = 'new'
}

const saveCategorias = () => {
    if (isValidFields()) {
        const categorias = {
            nome: document.getElementById('nome').value,
            ativo: document.getElementById('ativo').checked
        }

        const index = document.getElementById('nome').dataset.index

        if (index == 'new') {
            criarCategorias(categorias)
        } else {
            atualizarCategorias(index, categorias)
        }

        atualizarTabela()
        fecharModal()
    }
}

const createRow = (categorias, index) => {
    const newRow = document.createElement('tr')
    newRow.innerHTML = `
        <td><input type="checkbox" class="modal-box" disabled ${(categorias.ativo ? "checked" : "")}></td>
        <td>${categorias.nome}</td>
        <td>
            <button type="button" class="button green" id="edit-${index}">Editar</button>
            <button type="button" class="button red" id="delete-${index}">Excluir</button>
        </td>
    `
    document.querySelector('#tabelaCategorias>tbody').appendChild(newRow)
}

const limparTabela = () => {
    const rows = document.querySelectorAll('#tabelaCategorias>tbody tr')
    rows.forEach(row => row.parentNode.removeChild(row))
}

const atualizarTabela = () => {
    const dbCategorias = lerCategorias()
    limparTabela()
    dbCategorias.forEach(createRow)
}

const preencherCampos = (categorias) => {
    document.getElementById('nome').value = categorias.nome
    document.getElementById('ativo').checked = categorias.ativo
    document.getElementById('nome').dataset.index = categorias.index 
}

const editarCategorias = (index) => {
    const categorias = lerCategorias()[index]
    categorias.index = index
    preencherCampos(categorias)
    abrirModal()
}

const editarDeletar = (event) => {
    if (event.target.type == 'button') {
        const [action, index] = event.target.id.split('-')

        if (action == 'edit') {
            editarCategorias(index)
            atualizarTabela()
        } else {
            const categorias = lerCategorias()[index]
            const response = confirm(`Deseja realmente excluir o categorias ${categorias.nome}?`)
            
            if (response) {
                deleteCategorias(index)
                atualizarTabela()
            }
        }
    }
}

atualizarTabela()

//Eventos

document.getElementById('cadastrarCategorias').addEventListener('click' , abrirModal)

document.getElementById('modalClose').addEventListener('click' , fecharModal)

document.getElementById('salvar').addEventListener('click' , saveCategorias)

document.querySelector('#tabelaCategorias>tbody').addEventListener('click' , editarDeletar)

document.getElementById('cancelar').addEventListener('click' , fecharModal)
