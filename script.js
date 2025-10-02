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
  updateMunicipios(); // ✅ Agora sim, com UF já atualizada
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

function startLoading() {
  document.getElementById("progressSection").style.display = "block";
  setTimeout(() => {
    renderFiles();
    document.getElementById("filesSection").style.display = "block";
  }, 1200);
}

function renderFiles() {
  const regiao = document.getElementById("regiao").value || "TODOS";
  const uf = document.getElementById("uf").value || "TODOS";
  const macro = document.getElementById("macro").value || "TODOS";
  const regiaoSaude = document.getElementById("regiaoSaude").value || "TODOS";
  const municipio = document.getElementById("municipio").value || "TODOS";
  const unidade = document.getElementById("unidade").value || "TODOS";

  const resumo = `
    <strong>Briefing Gerado:</strong><br>
    Região: ${regiao}<br>
    UF: ${uf}<br>
    Macrorregião: ${macro}<br>
    Região de Saúde: ${regiaoSaude}<br>
    Município: ${municipio}<br>
    Unidade: ${unidade}<br>
  `;

  document.getElementById("filesSection").innerHTML = `
    <h2>Arquivos Gerados</h2>
    <p>${resumo}</p>
    <ul>
      <li><a href="#">📄 Briefing.docx</a></li>
      <li><a href="#">🗜️ Dados.zip</a></li>
    </ul>
  `;
}

function clearForm() {
  document.querySelectorAll("select").forEach(select => select.selectedIndex = 0);
  document.getElementById("progressSection").style.display = "none";
  document.getElementById("filesSection").style.display = "none";
  updateUF();
}


function animateProgressBar() {
  const fill = document.getElementById("progressFill");
  let progress = 0;
  const duration = 10000; // 10 segundos
  const interval = 100; // atualiza a cada 100ms
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


function startLoading() {
  document.getElementById("progressSection").style.display = "block";
  animateProgressBar(); // ⬅️ inicia animação
  setTimeout(() => {
    renderFiles();
    document.getElementById("filesSection").style.display = "block";
  }, 10000); // espera os 10 segundos da animação
}
