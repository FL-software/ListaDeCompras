'use strict'

// Abertura e Fechamento do pop-up

const abrirModal = () => document.getElementById('modal')
    .classList.add('active')

const fecharModal = () => {
    limparCampos()
    document.getElementById('modal').classList.remove('active')
}

// Leitura e Escrita na variavel local do navegador

const getLocalStorage = () => JSON.parse(localStorage.getItem('db_mercados')) ?? []

const setLocalStorage = (dbMercados) => localStorage.setItem("db_mercados" , JSON.stringify(dbMercados))

// CRUD - create read update delete

const criarMercados = (mercados) => {
    const dbMercados = getLocalStorage()
    dbMercados.push(mercados)
    setLocalStorage(dbMercados)
}

const lerMercados = () => getLocalStorage()

const atualizarMercados = (index, mercados) => {
    const dbMercados = lerMercados()
    dbMercados[index] = mercados
    setLocalStorage(dbMercados)
}

const deleteMercados = (index) => {
    const dbMercados = lerMercados()
    dbMercados.splice(index, 1)
    setLocalStorage(dbMercados)
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

const saveMercados = () => {
    if (isValidFields()) {
        const mercados = {
            nome: document.getElementById('nome').value,
            ativo: document.getElementById('ativo').checked
        }

        const index = document.getElementById('nome').dataset.index

        if (index == 'new') {
            criarMercados(mercados)
        } else {
            atualizarMercados(index, mercados)
        }

        atualizarTabela()
        fecharModal()
    }
}

const createRow = (mercados, index) => {
    const newRow = document.createElement('tr')
    newRow.innerHTML = `
        <td><input type="checkbox" class="modal-box" disabled ${(mercados.ativo ? "checked" : "")}></td>
        <td>${mercados.nome}</td>
        <td>
            <button type="button" class="button green" id="edit-${index}">Editar</button>
            <button type="button" class="button red" id="delete-${index}">Excluir</button>
        </td>
    `
    document.querySelector('#tabelaMercados>tbody').appendChild(newRow)
}

const limparTabela = () => {
    const rows = document.querySelectorAll('#tabelaMercados>tbody tr')
    rows.forEach(row => row.parentNode.removeChild(row))
}

const atualizarTabela = () => {
    const dbMercados = lerMercados()
    limparTabela()
    dbMercados.forEach(createRow)
}

const preencherCampos = (mercados) => {
    document.getElementById('nome').value = mercados.nome
    document.getElementById('ativo').checked = mercados.ativo
    document.getElementById('nome').dataset.index = mercados.index 
}

const editarMercados = (index) => {
    const mercados = lerMercados()[index]
    mercados.index = index
    preencherCampos(mercados)
    abrirModal()
}

const editarDeletar = (event) => {
    if (event.target.type == 'button') {
        const [action, index] = event.target.id.split('-')

        if (action == 'edit') {
            editarMercados(index)
            atualizarTabela()
        } else {
            const mercados = lerMercados()[index]
            const response = confirm(`Deseja realmente excluir a mercadoria ${mercados.nome}?`)
            
            if (response) {
                deleteMercados(index)
                atualizarTabela()
            }
        }
    }
}

atualizarTabela()

//Eventos

document.getElementById('cadastrarMercados').addEventListener('click' , abrirModal)

document.getElementById('modalClose').addEventListener('click' , fecharModal)

document.getElementById('salvar').addEventListener('click' , saveMercados)

document.querySelector('#tabelaMercados>tbody').addEventListener('click' , editarDeletar)

document.getElementById('cancelar').addEventListener('click' , fecharModal)
