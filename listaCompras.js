'use strict'

$(document).ready(function()
{
    $("#valor").maskMoney({
        prefix: "R$ ",
        decimal: ",",
        thousands: "."
    });
})

// Abertura e Fechamento do pop-up

const abrirModal = () => {      
    carregarMercados()
    carregarCategorias()
    document.getElementById('modal').classList.add('active')
}

const fecharModal = () => {
    limparCampos()
    document.getElementById('modal').classList.remove('active')
}

// Leitura e Escrita na variavel local do navegador

const getLocalStorage = () => JSON.parse(localStorage.getItem('db_produtos')) ?? []

const getLocalStorageQuantidade = () => JSON.parse(localStorage.getItem('db_quantidade')) ?? []

const getLocalStorageMercados = () => JSON.parse(localStorage.getItem('db_mercados')) ?? []

const getLocalStorageCategorias = () => JSON.parse(localStorage.getItem('db_categorias')) ?? []

const setLocalStorage = (dbProdutos) => localStorage.setItem("db_produtos" , JSON.stringify(dbProdutos))

// CRUD - create read update delete

const criarProdutos = (produtos) => {
    const dbProdutos = getLocalStorage()
    dbProdutos.push(produtos)
    setLocalStorage(dbProdutos)
}

const lerProdutos = () => getLocalStorage()

const lerQuantidade = () => getLocalStorageQuantidade()

const lerMercados = () => getLocalStorageMercados()

const lerCategorias = () => getLocalStorageCategorias()

const atualizarProdutos = (index, produtos) => {
    const dbProdutos = lerProdutos()
    dbProdutos[index] = produtos
    setLocalStorage(dbProdutos)
}

const deleteProdutos = (index) => {
    const dbProdutos = lerProdutos()
    dbProdutos.splice(index, 1)
    setLocalStorage(dbProdutos)
}

//Interação com o Layout

const selectQuantidade = $("#quantidade")

const carregarQuantidade = () => {
    const dbQuantidade = lerQuantidade()
    selectQuantidade.html("")
    selectQuantidade.append('<option value="" hidden>Quantidade</option>')
    dbQuantidade.forEach(createOptionQuantidade)
}

const createOptionQuantidade = (quantidade, index) => {
    if (quantidade.ativo) {
        selectQuantidade.append(`<option>${quantidade.nome}</option>`)
    }
}

const selectMercados = $("#mercado")

const carregarMercados = () => {
    const dbMercados = lerMercados()
    selectMercados.html("")
    selectMercados.append('<option value="" hidden>Qual Mercado?</option>')
    dbMercados.forEach(createOptionMercados)
}

const createOptionMercados = (mercados, index) => {
    if (mercados.ativo) {
        selectMercados.append(`<option>${mercados.nome}</option>`)
    }
}

const selectCategorias = $("#categoria")

const carregarCategorias = () => {
    const dbCategorias = lerCategorias()
    selectCategorias.html("")
    selectCategorias.append('<option value="" hidden>Qual Categoria?</option>')
    dbCategorias.forEach(createOptionCategorias)
}

const createOptionCategorias = (categorias, index) => {
    if (categorias.ativo) {
        selectCategorias.append(`<option>${categorias.nome}</option>`)
    }
}

const isValidFields = () => {
    return document.getElementById('form').reportValidity()
}

const limparCampos = () => {
    const fields = document.querySelectorAll('.modal-field')
    fields.forEach(field => field.value = "")
    document.getElementById('descricao').dataset.index = 'new'
}

const saveProdutos = () => {
    if (isValidFields()) {
        let valor = document.getElementById('valor').value
        valor = valor.replace("R$" , "")
        valor = valor.replace("." , "")
        valor = valor.replace("," , ".")

        const produtos = {
            comprado: false,
            descricao: document.getElementById('descricao').value,
            categoria: document.getElementById('categoria').value,            
            mercado: document.getElementById('mercado').value,
            quantidade: document.getElementById('quantidade').value,
            valor: valor
        }

        const index = document.getElementById('descricao').dataset.index

        if (index == 'new') {
            criarProdutos(produtos)
        } else {
            atualizarProdutos(index, produtos)
        }

        atualizarTabela()
        fecharModal()
    }
}

let saldo = 0;

const createRow = (produtos, index) => {
    const newRow = document.createElement('tr'); 
    let subtotal = produtos.valor * produtos.quantidade;

    saldo += subtotal;

    if (produtos.comprado) {
        newRow.style.backgroundColor = "#90EE90"
    }

    newRow.innerHTML = `   
        <td><input type="checkbox" class="modal-box" ${(produtos.comprado ? "checked" : "")} data-index=${index}></td>
        <td>${produtos.descricao}</td>
        <td>${produtos.categoria}</td>        
        <td>${produtos.mercado}</td>
        <td>${parseFloat(produtos.valor).toLocaleString("pt-BR", {style: 'currency',currency: 'BRL', minimumFractionDigits: 2})}</td>
        <td>${produtos.quantidade}</td>
        <td>${parseFloat(subtotal).toLocaleString("pt-BR", {style: 'currency',currency: 'BRL', minimumFractionDigits: 2})}</td>
        <td>${parseFloat(saldo).toLocaleString("pt-BR", {style: 'currency',currency: 'BRL', minimumFractionDigits: 2})}</td>
        <td>
            <button type="button" class="button green" id="edit-${index}">Editar</button>
            <button type="button" class="button red" id="delete-${index}">Excluir</button>
        </td>
    `
    document.querySelector('#tabelaProdutos>tbody').appendChild(newRow)
}

const limparTabela = () => {
    const rows = document.querySelectorAll('#tabelaProdutos>tbody tr')
    rows.forEach(row => row.parentNode.removeChild(row))
}

const atualizarTabela = () => {
    const dbProdutos = lerProdutos()
    limparTabela()
    saldo = 0;
    dbProdutos.forEach(createRow)
}

const preencherCampos = (produtos) => {        
    document.getElementById('descricao').value = produtos.descricao
    document.getElementById('categoria').value = produtos.categoria    
    document.getElementById('mercado').value = produtos.mercado
    document.getElementById('quantidade').value = produtos.quantidade
    document.getElementById('valor').value = parseFloat(produtos.valor).toLocaleString("pt-BR", {style: 'currency',currency: 'BRL', minimumFractionDigits: 2})
    document.getElementById('descricao').dataset.index = produtos.index
}

const editarProdutos = (index) => {
    const produtos = lerProdutos()[index]
    produtos.index = index
    abrirModal()
    preencherCampos(produtos)
}

const atualizarItem = (index) => {
    const produto = lerProdutos()[index]
    produto.comprado = !produto.comprado 
    atualizarProdutos(index, produto)
    atualizarTabela();
}

const editarDeletar = (event) => {
    if (event.target.type == 'button') {
        const [action, index] = event.target.id.split('-')

        if (action == 'edit') {
            editarProdutos(index)
            atualizarTabela()
        } else {
            const produtos = lerProdutos()[index]
            const response = confirm(`Deseja realmente excluir a movimentação ${produtos.descricao}?`)
            
            if (response) {
                deleteProdutos(index)
                atualizarTabela()
            }
        }
    } else if (event.target.type === 'checkbox') {
        const index = event.target.dataset.index;
        atualizarItem (index);
    }
}

atualizarTabela()

//Eventos

document.getElementById('cadastrarProdutos').addEventListener('click' , abrirModal)

document.getElementById('modalClose').addEventListener('click' , fecharModal)

document.getElementById('salvar').addEventListener('click' , saveProdutos)

document.querySelector('#tabelaProdutos>tbody').addEventListener('click' , editarDeletar)

document.getElementById('cancelar').addEventListener('click' , fecharModal)