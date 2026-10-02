// ===== CONFIG API =====
const API_URL = 'https://servix-api-1.onrender.com';
const ENDPOINT = '/api/profissionais/cadastro';

const CATEGORIAS = [
  { v: 'limpeza', l: 'Limpeza' },
  { v: 'manutencao', l: 'Manutenção' },
  { v: 'jardinagem', l: 'Jardinagem' },
  { v: 'reparos', l: 'Pequenos reparos' },
  { v: 'eletrica', l: 'Elétrica' },
  { v: 'hidraulica', l: 'Hidráulica' },
  { v: 'pintura', l: 'Pintura' },
  { v: 'montagem-moveis', l: 'Montagem de móveis' },
  { v: 'cuidados-idosos', l: 'Cuidados com idosos' },
  { v: 'baba', l: 'Babá' },
  { v: 'pet-sitter', l: 'Pet sitter' },
  { v: 'automotivo', l: 'Automotivo' },
  { v: 'logistica', l: 'Logística' },
  { v: 'tecnologia', l: 'Tecnologia' },
  { v: 'design', l: 'Design' },
  { v: 'marketing', l: 'Marketing' },
  { v: 'ia-automacao', l: 'IA e Automação' },
  { v: 'administrativo', l: 'Administrativo' },
  { v: 'outros', l: 'Outros' },
];

const form = document.getElementById('form');
const btn = document.getElementById('btn');
const alerta = document.getElementById('alerta');

// ===== INIT =====
document.getElementById('ano').textContent = new Date().getFullYear();

// Categorias
document.getElementById('categorias').innerHTML = CATEGORIAS.map((c) => `
  <label class="cat">
    <input type="checkbox" name="categorias" value="${c.v}" />
    <span class="check"></span>
    <span class="lbl">${c.l}</span>
  </label>
`).join('');

// Máscaras
aplicarMascara(form.telefone, 'telefone');
aplicarMascara(form.cpf, 'cpf');
aplicarMascara(form.cep, 'cep');

// ===== MÁSCARAS =====
function aplicarMascara(input, tipo) {
  if (!input) return;
  input.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (tipo === 'telefone') {
      v = v.slice(0, 11);
      if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
      else if (v.length > 0) v = v.replace(/^(\d{0,2}).*/, '($1');
    } else if (tipo === 'cpf') {
      v = v.slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else if (tipo === 'cep') {
      v = v.slice(0, 8);
      if (v.length > 5) v = v.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    }
    e.target.value = v;
  });
}

// ===== VALIDAÇÃO =====
function limparErros() {
  document.querySelectorAll('.field').forEach((f) => {
    f.classList.remove('has-err');
    const i = f.querySelector('input,select,textarea');
    if (i) i.classList.remove('err');
    const m = f.querySelector('.err');
    if (m) m.textContent = '';
  });
  document.querySelectorAll('.termos .err').forEach((m) => { m.textContent = ''; m.style.display = 'none'; });
}

function marcarErro(nome, msg) {
  const input = form.querySelector(`[name="${nome}"]`);
  if (!input) return;
  const field = input.closest('.field') || input.closest('.termos');
  if (field) {
    field.classList.add('has-err');
    input.classList.add('err');
    const m = field.querySelector('.err');
    if (m) { m.textContent = msg; m.style.display = 'block'; }
  }
}

function validar() {
  limparErros();
  const erros = [];

  const dados = {
    nome: form.nome.value.trim(),
    email: form.email.value.trim(),
    telefone: form.telefone.value.trim(),
    senha: form.senha.value,
    senhaConfirm: form.senhaConfirm.value,
    cidade: form.cidade.value.trim(),
    estado: form.estado.value,
    categorias: [...document.querySelectorAll('[name="categorias"]:checked')].map((c) => c.value),
    termos: form.termos.checked,
  };

  if (!dados.nome || dados.nome.length < 3) erros.push(['nome', 'Informe seu nome completo']);
  if (!dados.email || !/^\S+@\S+\.\S+$/.test(dados.email)) erros.push(['email', 'E-mail inválido']);
  if (!dados.telefone || dados.telefone.replace(/\D/g, '').length < 10) erros.push(['telefone', 'Telefone inválido']);
  if (!dados.senha || dados.senha.length < 6) erros.push(['senha', 'Mínimo 6 caracteres']);
  if (dados.senha !== dados.senhaConfirm) erros.push(['senhaConfirm', 'As senhas não coincidem']);
  if (!dados.cidade) erros.push(['cidade', 'Informe sua cidade']);
  if (!dados.estado) erros.push(['estado', 'Selecione o estado']);
  if (dados.categorias.length === 0) {
    const field = document.querySelector('.field:has(.categorias)');
    if (field) {
      field.classList.add('has-err');
      const m = field.querySelector('.err');
      if (m) { m.textContent = 'Selecione ao menos uma categoria'; m.style.display = 'block'; }
    }
    erros.push(['categorias', '']);
  }
  if (!dados.termos) erros.push(['termos', 'Você precisa aceitar os termos']);

  return { erros, dados };
}

// ===== SUBMIT =====
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  alerta.style.display = 'none';

  const { erros, dados } = validar();

  if (erros.length > 0) {
    erros.forEach(([nome, msg]) => msg && marcarErro(nome, msg));
    alerta.className = 'alerta alerta-erro';
    alerta.textContent = `Corrija ${erros.length} campo(s).`;
    alerta.style.display = 'flex';
    const primeiro = document.querySelector('.has-err');
    if (primeiro) primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const payload = {
    nome: dados.nome,
    email: dados.email.toLowerCase(),
    senha: dados.senha,
    telefone: dados.telefone,
    cidade: dados.cidade,
    estado: dados.estado,
    bairro: form.bairro.value.trim(),
    cep: form.cep.value.trim(),
    categorias: dados.categorias,
    experienciaAnos: Number(form.experienciaAnos.value) || 0,
    disponibilidade: form.disponibilidade.value,
    descricao: form.descricao.value.trim(),
  };
  if (form.cpf.value.trim()) payload.cpf = form.cpf.value.trim();

  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      // Erros da API
      if (json.erros && Array.isArray(json.erros)) {
        json.erros.forEach((e) => marcarErro(e.campo, e.mensagem));
        alerta.className = 'alerta alerta-erro';
        alerta.textContent = 'Corrija os campos destacados.';
        alerta.style.display = 'flex';
      } else {
        throw new Error(json.mensagem || 'Erro ao cadastrar');
      }
      return;
    }

    alerta.className = 'alerta alerta-sucesso';
    alerta.textContent = '🎉 Cadastro realizado com sucesso! Bem-vindo(a) à SERVIX.';
    alerta.style.display = 'flex';
    form.reset();
    alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    alerta.className = 'alerta alerta-erro';
    alerta.textContent = err.message || 'Erro ao conectar. Tente novamente.';
    alerta.style.display = 'flex';
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
});
