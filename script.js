let contas = [];
let transacoes = 0;

function switchTab(tab) {
  const nomes = ['criar', 'operacoes', 'contas', 'extrato'];
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', nomes[i] === tab);
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  if (tab === 'operacoes') atualizaSelectOp();
  if (tab === 'contas') renderContas();
  if (tab === 'extrato') { atualizaSelectExt(); renderExtrato(); }
}

function showMsg(id, txt, tipo) {
  const el = document.getElementById(id);
  el.innerHTML = `<div class="msg ${tipo}">${txt}</div>`;
  setTimeout(() => el.innerHTML = '', 3000);
}

function atualizaMetrics() {
  document.getElementById('total-contas').textContent = contas.length;
  const total = contas.reduce((s, c) => s + c.saldo, 0);
  document.getElementById('saldo-total').textContent = 'R$ ' + total.toFixed(2);
  document.getElementById('total-trans').textContent = transacoes;
}

function criarConta() {
  const nome = document.getElementById('novo-nome').value.trim();
  const saldo = parseFloat(document.getElementById('novo-saldo').value);
  if (!nome) return showMsg('msg-criar', 'Informe o nome do titular', 'error');
  if (isNaN(saldo) || saldo < 0) return showMsg('msg-criar', 'Informe um saldo válido', 'error');
  if (contas.find(c => c.nome.toLowerCase() === nome.toLowerCase()))
    return showMsg('msg-criar', 'Já existe uma conta com esse nome', 'error');
  contas.push({ nome, saldo, extrato: [{ desc: 'Abertura de conta', valor: saldo, tipo: 'plus' }] });
  document.getElementById('novo-nome').value = '';
  document.getElementById('novo-saldo').value = '';
  atualizaMetrics();
  showMsg('msg-criar', 'Conta criada com sucesso!', 'success');
}

function atualizaSelectOp() {
  const sel = document.getElementById('op-conta');
  sel.innerHTML = contas.length
    ? contas.map(c => `<option>${c.nome}</option>`).join('')
    : '<option>Nenhuma conta cadastrada</option>';
}

function atualizaSelectExt() {
  const sel = document.getElementById('ext-conta');
  sel.innerHTML = contas.length
    ? contas.map(c => `<option>${c.nome}</option>`).join('')
    : '<option>Nenhuma conta cadastrada</option>';
}

function operacao(tipo) {
  const nome = document.getElementById('op-conta').value;
  const valor = parseFloat(document.getElementById('op-valor').value);
  const conta = contas.find(c => c.nome === nome);
  if (!conta) return showMsg('msg-op', 'Conta não encontrada', 'error');
  if (isNaN(valor) || valor <= 0) return showMsg('msg-op', 'Informe um valor válido', 'error');
  if (tipo === 'saque' && valor > conta.saldo) return showMsg('msg-op', 'Saldo insuficiente', 'error');
  if (tipo === 'deposito') {
    conta.saldo += valor;
    conta.extrato.push({ desc: 'Depósito', valor, tipo: 'plus' });
    showMsg('msg-op', 'Depósito realizado com sucesso!', 'success');
  } else {
    conta.saldo -= valor;
    conta.extrato.push({ desc: 'Saque', valor, tipo: 'minus' });
    showMsg('msg-op', 'Saque realizado com sucesso!', 'success');
  }
  transacoes++;
  document.getElementById('op-valor').value = '';
  atualizaMetrics();
}

function renderContas() {
  const el = document.getElementById('lista-contas');
  if (!contas.length) { el.innerHTML = '<div class="empty">Nenhuma conta cadastrada</div>'; return; }
  el.innerHTML = contas.map(c => `
    <div class="account-item">
      <span class="account-name">${c.nome}</span>
      <span class="account-balance">R$ ${c.saldo.toFixed(2)}</span>
    </div>`).join('');
}

function renderExtrato() {
  const nome = document.getElementById('ext-conta').value;
  const conta = contas.find(c => c.nome === nome);
  const el = document.getElementById('lista-extrato');
  if (!conta) { el.innerHTML = '<div class="empty">Selecione uma conta</div>'; return; }
  el.innerHTML = [...conta.extrato].reverse().map(t => `
    <div class="extrato-item">
      <span>${t.desc}</span>
      <span class="extrato-${t.tipo}">${t.tipo === 'plus' ? '+' : '-'} R$ ${t.valor.toFixed(2)}</span>
    </div>`).join('');
}
