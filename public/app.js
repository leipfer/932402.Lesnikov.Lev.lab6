if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker успешно зарегистрирован с областью:', reg.scope);
      })
      .catch((err) => {
        console.error('[PWA] Ошибка регистрации Service Worker:', err);
      });
  });
}

function updateOnlineStatus() {
  const badge = document.getElementById('networkBadge');
  const statusText = document.getElementById('networkText');
  if (!badge || !statusText) return;

  if (navigator.onLine) {
    badge.classList.remove('offline');
    statusText.textContent = 'Онлайн';
  } else {
    badge.classList.add('offline');
    statusText.textContent = 'Офлайн';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
document.addEventListener('DOMContentLoaded', updateOnlineStatus);

let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) {
    installBtn.style.display = 'inline-flex';
  }
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Результат установки:', outcome);
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
}

window.addEventListener('appinstalled', () => {
  console.log('[PWA] Приложение успешно установлено!');
  if (installBtn) installBtn.style.display = 'none';
});

async function fetchServerStatus() {
  const uptimeEl = document.getElementById('uptimeVal');
  const memoryEl = document.getElementById('memoryVal');
  const cpuEl = document.getElementById('cpuVal');
  const timestampEl = document.getElementById('timestampVal');
  const rawJsonEl = document.getElementById('rawJson');
  const refreshBtn = document.getElementById('refreshBtn');

  if (!uptimeEl) return;

  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Загрузка...';
  }

  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    if (data.offline) {
      if (rawJsonEl) rawJsonEl.textContent = JSON.stringify(data, null, 2);
      return;
    }

    uptimeEl.textContent = data.uptimeSeconds;
    memoryEl.textContent = data.memoryUsageMB;
    cpuEl.textContent = data.cpuCount;
    timestampEl.textContent = new Date(data.timestamp).toLocaleString('ru-RU');

    if (rawJsonEl) {
      rawJsonEl.textContent = JSON.stringify(data, null, 2);
    }
  } catch (err) {
    console.warn('[PWA] Не удалось получить данные от сервера:', err);
    if (rawJsonEl) {
      rawJsonEl.textContent = JSON.stringify({ error: 'Сервер недоступен (офлайн)' }, null, 2);
    }
  } finally {
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.textContent = 'Обновить данные';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchServerStatus);
    fetchServerStatus();
  }
});
