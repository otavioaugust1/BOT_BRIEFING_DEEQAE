let dados = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch("bd/cnes/unidade_cnes.csv")
    .then(response => response.text())
    .then(csv => {
      dados = parseCSV(csv);
      updateUF();
    });
});

function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(";").map(h => h.replace(/"/g, "").trim());

  return lines.slice(1).map(line => {
    const values = line.split(";").map(v => v.replace(/"/g, "").trim());
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i];
    });
    return {
      regiao: obj["REGIAO"],
      uf: obj["UF_DESC"],
      macro: obj["CO_MACROREGIAO_SAUDE"],
      regiaoSaude: obj["CO_REGIAO_SAUDE"],
      municipio: obj["MUNICIPIO"],
      unidade: `${obj["NOME_FANTASIA"]} - ${obj["CNES"]}`
    };
  });
}

function updateUF() {
  const regiao = document.getElementById("regiao").value;
  const ufSelect = document.getElementById("uf");
  ufSelect.innerHTML = '<option value="">TODOS</option>';

  const ufs = [...new Set(dados
    .filter(d => !regiao || d.regiao.toUpperCase() === regiao.toUpperCase())
    .map(d => d.uf))].sort();

  ufs.forEach(uf => {
    const option = document.createElement("option");
    option.value = uf;
    option.textContent = uf;
    ufSelect.appendChild(option);
  });

  clearSelect("macro");
  clearSelect("regiaoSaude");
  clearSelect("unidade");

  document.getElementById("uf").addEventListener("change", () => {
    updateMacro();
    updateMunicipios();
  });
}

function updateMacro() {
  const uf = document.getElementById("uf").value;
  const macroSelect = document.getElementById("macro");
  macroSelect.innerHTML = '<option value="">TODOS</option>';

  const macros = [...new Set(dados
    .filter(d => !uf || d.uf === uf)
    .map(d => d.macro))].sort();

  macros.forEach(macro => {
    const option = document.createElement("option");
    option.value = macro;
    option.textContent = macro;
    macroSelect.appendChild(option);
  });

  clearSelect("regiaoSaude");
  clearSelect("unidade");
}

function updateRegiaoSaude() {
  const uf = document.getElementById("uf").value;
  const macro = document.getElementById("macro").value;
  const regiaoSaudeSelect = document.getElementById("regiaoSaude");
  regiaoSaudeSelect.innerHTML = '<option value="">TODOS</option>';

  const regioes = [...new Set(dados
    .filter(d => (!uf || d.uf === uf) && (!macro || d.macro === macro))
    .map(d => d.regiaoSaude))].sort();

  regioes.forEach(rs => {
    const option = document.createElement("option");
    option.value = rs;
    option.textContent = rs;
    regiaoSaudeSelect.appendChild(option);
  });

  clearSelect("unidade");
}

function updateMunicipios() {
  const uf = document.getElementById("uf").value;
  const municipioSelect = document.getElementById("municipio");
  municipioSelect.innerHTML = '<option value="">TODOS</option>';

  if (!uf) {
    municipioSelect.disabled = true;
    return;
  }

  const municipios = [...new Set(dados
    .filter(d => d.uf === uf)
    .map(d => d.municipio))].sort();

  municipios.forEach(mun => {
    const option = document.createElement("option");
    option.value = mun;
    option.textContent = mun;
    municipioSelect.appendChild(option);
  });

  municipioSelect.disabled = false;
}

function updateUnidade() {
  const municipio = document.getElementById("municipio").value;
  const unidadeSelect = document.getElementById("unidade");
  unidadeSelect.innerHTML = '<option value="">TODOS</option>';

  const unidades = [...new Set(dados
    .filter(d => !municipio || d.municipio === municipio)
    .map(d => d.unidade))].sort();

  unidades.forEach(u => {
    const option = document.createElement("option");
    option.value = u;
    option.textContent = u;
    unidadeSelect.appendChild(option);
  });
}

function clearSelect(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '<option value="">TODOS</option>';
}

function gerarResumo() {
  const regiao = document.getElementById("regiao").value || "TODOS";
  const uf = document.getElementById("uf").value || "TODOS";
  const macro = document.getElementById("macro").value || "TODOS";
  const regiaoSaude = document.getElementById("regiaoSaude").value || "TODOS";
  const municipio = document.getElementById("municipio").value || "TODOS";
  const unidade = document.getElementById("unidade").value || "TODOS";

  return `
    <strong>Briefing Gerado:</strong><br>
    Região: ${regiao}<br>
    UF: ${uf}<br>
    Macrorregião: ${macro}<br>
    Região de Saúde: ${regiaoSaude}<br>
    Município: ${municipio}<br>
    Unidade: ${unidade}<br>
  `;
}

function renderFilesCompleto() {
  const resumo = gerarResumo();
  document.getElementById("filesSection_c").innerHTML = `
    <h2>Arquivos Gerados - COMPLETO</h2>
    <p>${resumo}</p>
    <ul>
      <li><a href="#">📄 Briefing_C.docx</a></li>
      <li><a href="#">🗜️ Dados_C.zip</a></li>
    </ul>
  `;
}

function renderFilesSimplificado() {
  const resumo = gerarResumo();
  document.getElementById("filesSection_s").innerHTML = `
    <h2>Arquivos Gerados - SIMPLIFICADO</h2>
    <p>${resumo}</p>
    <ul>
      <li><a href="#">📄 Briefing_S.docx</a></li>
      <li><a href="#">🗜️ Dados_S.zip</a></li>
    </ul>
  `;
}

function animateProgressBar() {
  const fill = document.getElementById("progressFill");
  let progress = 0;
  const duration = 10000;
  const interval = 100;
  const step = 100 / (duration / interval);

  const timer = setInterval(() => {
    progress += step;
    if (progress >= 100) {
      progress = 100;
      clearInterval(timer);
    }
    fill.style.width = `${progress}%`;
    fill.textContent = `${Math.round(progress)}%`;
  }, interval);
}

function startLoadingCompleto() {
  document.getElementById("progressSection").style.display = "block";
  animateProgressBar();
  setTimeout(() => {
    renderFilesCompleto();
    document.getElementById("filesSection_c").style.display = "block";
  }, 10000);
}

function startLoadingSimplificado() {
  document.getElementById("progressSection").style.display = "block";
  animateProgressBar();
  setTimeout(() => {
    renderFilesSimplificado();
    document.getElementById("filesSection_s").style.display = "block";
  }, 10000);
}

function clearForm() {
  document.querySelectorAll("select").forEach(select => select.selectedIndex = 0);
  document.getElementById("progressSection").style.display = "none";
  document.getElementById("filesSection_c").style.display = "none";
  document.getElementById("filesSection_s").style.display = "none";
  updateUF();
}



/* LÓGICA DE LOGIN */
document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault();

  // Credenciais de Demonstração
  const CORRECT_USER = 'COQAE';
  const CORRECT_PASS = '123456';

  const usernameInput = document.getElementById('username').value.trim();
  const passwordInput = document.getElementById('password').value.trim();
  const errorMessage = document.getElementById('errorMessage');

  // Verifica se as credenciais de demonstração estão corretas
  if (usernameInput === CORRECT_USER && passwordInput === CORRECT_PASS) {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // REDIRECIONAMENTO PARA O SEU FRONT-END REAL
    window.location.href = 'briefing_app.html';

  } else {
    // Caso o usuário erre a senha/login de demonstração
    errorMessage.textContent = 'Usuário ou senha de demonstração incorretos.';
    errorMessage.style.display = 'block';
  }
});


/* LÓGICA DO MODAL "ESQUECEU SUA SENHA" */
function openForgotModal() {
  document.getElementById('forgotModal').style.display = 'flex';
}

function closeForgotModal() {
  document.getElementById('forgotModal').style.display = 'none';
  // Reseta o formulário e a mensagem ao fechar
  document.getElementById('forgotForm').reset();
  document.getElementById('forgotMessage').style.display = 'none';
  document.getElementById('forgotForm').style.display = 'block';
}

function submitForgotForm() {
  const emailInput = document.getElementById('forgotEmail');
  const forgotMessage = document.getElementById('forgotMessage');
  const forgotForm = document.getElementById('forgotForm');

  // Garante que o e-mail não está vazio e é válido (pelo browser)
  if (emailInput.value.trim() && forgotForm.checkValidity()) {

    // 1. Esconde o formulário
    forgotForm.style.display = 'none';

    // 2. Define e mostra a mensagem de sucesso
    forgotMessage.textContent = '✅ Seu e-mail foi enviado com sucesso. Entraremos em contato em breve.';
    forgotMessage.style.display = 'block';

    // 3. Fecha o modal automaticamente após 5 segundos
    setTimeout(function () {
      closeForgotModal();
    }, 5000);

  } else {
    alert("Por favor, preencha o campo de e-mail corretamente.");
  }
}

/** * FUNÇÃO DE SAÍDA (LOGOUT): 
 * Redireciona o usuário de volta para a tela de login (index.html).
 */
function logout() {
    window.location.href = 'index.html';
}