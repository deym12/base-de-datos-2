(() => {
  'use strict';

  const config = window.PORTAFOLIO_CONFIG;
  const units = {
    u1: { roman: 'I', title: 'Unidad I: Introducción a Bases de Datos', description: 'Fundamentos, modelo relacional, SQL básico y DDL.', weeks: [
      { number: 1, global: 1, title: 'Semana 01', description: 'Conceptos básicos' },
      { number: 2, global: 2, title: 'Semana 02', description: 'Modelo Relacional' },
      { number: 3, global: 3, title: 'Semana 03', description: 'SQL DDL' },
      { number: 4, global: 4, title: 'Semana 04', description: 'SQL DML' }
    ] },
    u2: { roman: 'II', title: 'Unidad II: Diseño y Normalización', description: 'Modelado ER, formas normales e integridad referencial.', weeks: [
      { number: 1, global: 5, title: 'Semana 05', description: 'Entidad-Relación' },
      { number: 2, global: 6, title: 'Semana 06', description: 'Mapeo' },
      { number: 3, global: 7, title: 'Semana 07', description: 'Normalización' },
      { number: 4, global: 8, title: 'Semana 08', description: 'Integridad' }
    ] },
    u3: { roman: 'III', title: 'Unidad III: SQL Avanzado', description: 'Consultas complejas, vistas y procedimientos.', weeks: [
      { number: 1, global: 9, title: 'Semana 09', description: 'Joins y Subconsultas' },
      { number: 2, global: 10, title: 'Semana 10', description: 'Vistas' },
      { number: 3, global: 11, title: 'Semana 11', description: 'Procedimientos' },
      { number: 4, global: 12, title: 'Semana 12', description: 'Triggers' }
    ] },
    u4: { roman: 'IV', title: 'Unidad IV: Bases de Datos NoSQL', description: 'MongoDB, Redis y comparativa con SQL.', weeks: [
      { number: 1, global: 13, title: 'Semana 13', description: 'Intro NoSQL' },
      { number: 2, global: 14, title: 'Semana 14', description: 'MongoDB' },
      { number: 3, global: 15, title: 'Semana 15', description: 'Redis' },
      { number: 4, global: 16, title: 'Semana 16', description: 'Proyecto Final' }
    ] }
  };

  const state = { unit: 'u1', theme: 'dark', openWeeks: {}, filesByWeek: new Map(), loading: new Set() };
  const $ = (id) => document.getElementById(id);
  const repoUrl = `https://github.com/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repository)}`;
  let repoCheckPromise = null;
  $('repo-link').href = repoUrl;

  function weekFolder(week) {
    return `${config.worksDirectory}/semana-${String(week.global).padStart(2, '0')}`;
  }

  function rawUrl(filePath) {
    const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
    return `https://raw.githubusercontent.com/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repository)}/${encodeURIComponent(config.branch)}/${encodedPath}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function ir(destination) {
    document.querySelectorAll('.pg').forEach((page) => page.classList.add('hid'));
    document.querySelectorAll('.nl').forEach((button) => button.classList.remove('on'));

    if (destination === 'home') {
      $('pg-home').classList.remove('hid');
      $('n-home').classList.add('on');
      return;
    }

    if (!units[destination]) return;
    state.unit = destination;
    $('pg-unidad').classList.remove('hid');
    $(`n-${destination}`).classList.add('on');
    renderUnit();
    loadUnitWeeks(destination);
  }

  function renderUnit() {
    const unit = units[state.unit];
    $('ubadge').textContent = unit.roman;
    $('utitle').textContent = unit.title;
    $('usub').textContent = unit.description;
    renderWeeks();
  }

  function renderWeeks() {
    const unit = units[state.unit];
    const list = $('wlist');
    list.replaceChildren();

    unit.weeks.forEach((week) => {
      const key = weekFolder(week);
      const status = state.filesByWeek.get(key);
      const isLoading = state.loading.has(key);
      const files = Array.isArray(status) ? status : [];
      const card = document.createElement('article');
      card.className = `wi${state.openWeeks[key] ? ' open' : ''}`;

      const header = document.createElement('button');
      header.className = 'wh';
      header.type = 'button';
      header.setAttribute('aria-expanded', String(Boolean(state.openWeeks[key])));
      header.innerHTML = `<span class="wnum">${String(week.global).padStart(2, '0')}</span>
        <span class="winfo"><span class="wt">${escapeHtml(week.title)}</span><br><span class="wd">${escapeHtml(week.description)}</span></span>
        <span class="wb ${isLoading ? 'wb-no' : files.length ? 'wb-ok' : 'wb-no'}">${isLoading ? 'Cargando…' : `${files.length} JPG${files.length === 1 ? '' : 's'}`}</span>
        <span class="warr" aria-hidden="true">▾</span>`;
      header.addEventListener('click', () => {
        state.openWeeks[key] = !state.openWeeks[key];
        renderWeeks();
      });

      const content = document.createElement('div');
      content.className = 'wcont';
      const inner = document.createElement('div');
      inner.className = 'win';
      if (isLoading) {
        inner.innerHTML = '<p class="empty-state">Consultando las imágenes de esta semana…</p>';
      } else if (status instanceof Error) {
        inner.innerHTML = `<div class="error-state"><strong>No se pudieron cargar los trabajos.</strong><br>${escapeHtml(status.message)}<br><button class="sync-link" type="button" data-retry="${escapeHtml(key)}">Intentar de nuevo</button></div>`;
        inner.querySelector('[data-retry]').addEventListener('click', () => loadWeek(week, true));
      } else if (!status) {
        inner.innerHTML = '<p class="empty-state">Preparando la lista de trabajos…</p>';
      } else if (files.length === 0) {
        inner.innerHTML = `<p class="empty-state">📂 Todavía no hay imágenes JPG para la ${escapeHtml(week.title.toLowerCase())}.</p>`;
      } else {
        const heading = document.createElement('p');
        heading.className = 'works-heading';
        heading.textContent = '📁 Trabajos publicados en GitHub';
        inner.appendChild(heading);
        files.forEach((file) => inner.appendChild(createWorkCard(file)));
      }
      content.appendChild(inner);
      card.append(header, content);
      list.appendChild(card);
    });
  }

  function createWorkCard(file) {
    const path = `${weekFolder(file.week)}/${file.name}`;
    const imageUrl = rawUrl(path);
    const article = document.createElement('article');
    article.className = 'work-card';
    const previewLink = document.createElement('a');
    previewLink.className = 'work-preview';
    previewLink.href = imageUrl;
    previewLink.target = '_blank';
    previewLink.rel = 'noopener noreferrer';
    previewLink.setAttribute('aria-label', `Abrir imagen ${file.name} en una pestaña nueva`);
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = file.title;
    image.loading = 'lazy';
    image.addEventListener('error', () => {
      image.remove();
      const warning = document.createElement('span');
      warning.className = 'preview-error';
      warning.textContent = 'No se pudo mostrar la vista previa';
      previewLink.appendChild(warning);
    }, { once: true });
    previewLink.appendChild(image);

    const details = document.createElement('div');
    details.className = 'work-details';
    const title = document.createElement('strong');
    title.className = 'mt';
    title.textContent = file.title;
    const filename = document.createElement('span');
    filename.className = 'mm';
    filename.textContent = file.name;
    details.append(title, filename);

    const actions = document.createElement('div');
    actions.className = 'work-actions';
    const openLink = document.createElement('a');
    openLink.className = 'dlb';
    openLink.href = imageUrl;
    openLink.target = '_blank';
    openLink.rel = 'noopener noreferrer';
    openLink.textContent = 'Ver imagen';
    const downloadButton = document.createElement('button');
    downloadButton.className = 'dlb download-btn';
    downloadButton.type = 'button';
    downloadButton.textContent = 'Descargar';
    downloadButton.addEventListener('click', () => downloadImage(imageUrl, file.name));
    actions.append(openLink, downloadButton);
    article.append(previewLink, details, actions);
    return article;
  }

  async function fetchWeekFiles(week) {
    await ensureRepository();
    const folder = weekFolder(week);
    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repository)}/contents/${folder.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(config.branch)}`;
    const response = await fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
    if (response.status === 404) return [];
    if (response.status === 403 || response.status === 429) {
      throw new Error('GitHub limitó temporalmente las consultas. Espera un momento y vuelve a actualizar.');
    }
    if (!response.ok) {
      throw new Error(`GitHub respondió con el estado ${response.status}. Comprueba el nombre y la visibilidad del repositorio.`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('La carpeta de trabajos no tiene el formato esperado.');
    return data
      .filter((entry) => entry.type === 'file' && /\.(jpe?g)$/i.test(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { numeric: true }))
      .map((entry) => ({ name: entry.name, title: readableTitle(entry.name), week }));
  }

  async function ensureRepository() {
    if (!repoCheckPromise) {
      repoCheckPromise = (async () => {
        const base = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repository)}`;
        const repoResponse = await fetch(base, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
        if (repoResponse.status === 404) {
          throw new Error(`No se encontró el repositorio público ${config.owner}/${config.repository}. Revisa config.js y que el repositorio sea público.`);
        }
        if (repoResponse.status === 403 || repoResponse.status === 429) {
          throw new Error('GitHub limitó temporalmente las consultas. Espera un momento y vuelve a actualizar.');
        }
        if (!repoResponse.ok) throw new Error(`No se pudo comprobar el repositorio (estado ${repoResponse.status}).`);

        const branchUrl = `${base}/branches/${encodeURIComponent(config.branch)}`;
        const branchResponse = await fetch(branchUrl, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
        if (branchResponse.status === 404) {
          throw new Error(`No se encontró la rama “${config.branch}”. Corrige el nombre de la rama en config.js.`);
        }
        if (!branchResponse.ok) throw new Error(`No se pudo comprobar la rama (estado ${branchResponse.status}).`);
      })();
    }
    return repoCheckPromise;
  }

  function readableTitle(filename) {
    return filename.replace(/\.(jpe?g)$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Trabajo de la semana';
  }

  async function loadWeek(week, force = false) {
    const key = weekFolder(week);
    if (!force && (state.filesByWeek.has(key) || state.loading.has(key))) return;
    state.loading.add(key);
    state.filesByWeek.delete(key);
    setSyncMessage('Consultando el repositorio de GitHub…');
    renderWeeks();
    try {
      state.filesByWeek.set(key, await fetchWeekFiles(week));
    } catch (error) {
      state.filesByWeek.set(key, error instanceof Error ? error : new Error('Ocurrió un error inesperado al consultar GitHub.'));
    } finally {
      state.loading.delete(key);
      if (state.unit === Object.keys(units).find((id) => units[id].weeks.some((item) => item.global === week.global))) {
        renderWeeks();
      }
      updateSyncMessage();
    }
  }

  function loadUnitWeeks(unitId, force = false) {
    units[unitId].weeks.forEach((week) => loadWeek(week, force));
  }

  function updateSyncMessage() {
    const current = units[state.unit].weeks.map((week) => state.filesByWeek.get(weekFolder(week)));
    if (current.some((value) => value instanceof Error)) {
      setSyncMessage('Hubo un problema consultando GitHub. Revisa la configuración o intenta actualizar.');
    } else if (current.some((value) => value === undefined) || current.some((_, index) => state.loading.has(weekFolder(units[state.unit].weeks[index])))) {
      setSyncMessage('Consultando los trabajos de esta unidad en GitHub…');
    } else {
      const count = current.reduce((sum, value) => sum + (Array.isArray(value) ? value.length : 0), 0);
      setSyncMessage(`${count} imagen${count === 1 ? '' : 'es'} JPG encontrada${count === 1 ? '' : 's'} en esta unidad · actualizado desde GitHub.`);
    }
  }

  function setSyncMessage(message) { $('sync-status').textContent = message; }

  function actualizarTrabajos() {
    state.filesByWeek.clear();
    state.loading.clear();
    repoCheckPromise = null;
    setSyncMessage('Actualizando la lista de imágenes desde GitHub…');
    loadUnitWeeks(state.unit, true);
    toast('Actualizando los trabajos de GitHub…', 'tok');
  }

  async function downloadImage(url, filename) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      toast('Descarga iniciada.', 'tok');
    } catch (_) {
      // GitHub sirve el archivo, pero el navegador puede bloquear la descarga entre dominios.
      // En ese caso, abrir el JPG permite guardarlo con la opción del navegador.
      window.open(url, '_blank', 'noopener,noreferrer');
      toast('Se abrió la imagen. Usa “Guardar imagen como…” si la descarga no inicia.', 'terr');
    }
  }

  function toast(message, type = '') {
    const item = document.createElement('div');
    item.className = `tst ${type}`;
    item.textContent = message;
    $('toasts').appendChild(item);
    window.setTimeout(() => item.remove(), 4000);
  }

  function toggleTema() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light', state.theme === 'light');
    $('tbtn').textContent = state.theme === 'dark' ? '☀️' : '🌙';
    try { localStorage.setItem('portafolio-tema', state.theme); } catch (_) { /* storage opcional */ }
  }

  function handleAiInput(event) {
    if (event.key !== 'Enter') return;
    const value = event.target.value.toLowerCase();
    let answer = 'Interesante pregunta. Soy tu asistente de Base de Datos II.';
    if (value.includes('hola')) answer = '¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte?';
    if (value.includes('unidad 1')) answer = '📖 La Unidad I trata sobre conceptos básicos y SQL.';
    if (value.includes('quien eres') || value.includes('quién eres')) answer = '🤖 Soy el asistente del portafolio de Dilmer Yupanqui.';
    if (value.includes('trabajo') || value.includes('jpg')) answer = 'Puedes ver los JPG de cada semana en Unidad I, II, III o IV. Se leen desde el repositorio de GitHub.';
    $('ai-text-response').textContent = answer;
    event.target.value = '';
  }

  window.ir = ir;
  window.actualizarTrabajos = actualizarTrabajos;
  window.toggleTema = toggleTema;
  window.handleAiInput = handleAiInput;

  window.addEventListener('DOMContentLoaded', () => {
    try {
      if (localStorage.getItem('portafolio-tema') === 'light') {
        state.theme = 'light';
        document.body.classList.add('light');
        $('tbtn').textContent = '🌙';
      }
    } catch (_) { /* storage opcional */ }
    ir('home');
    window.setTimeout(() => $('ai-bubble').classList.add('show'), 2000);
  });
})();
