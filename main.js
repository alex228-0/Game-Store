import './style.css';

// Данные игр
const gamesData = [
  {
    id: 1,
    title: 'Neon Cyberpunk 2077',
    image: '/images/game_cover_1_1779370353557.png',
    tags: ['Киберпанк', 'RPG', 'Открытый мир'],
    price: 59.99,
    discount: 0,
    isPopular: true
  },
  {
    id: 2,
    title: 'Elden Dragons: The Dark Era',
    image: '/images/game_cover_2_1779370687406.png',
    tags: ['Фэнтези', 'RPG', 'Соулслайк'],
    price: 69.99,
    discount: 20,
    isPopular: true
  },
  {
    id: 3,
    title: 'Stellar Conquest: Galaxy',
    image: '/images/game_cover_3_1779370707396.png',
    tags: ['Космос', 'Стратегия', 'RTS'],
    price: 39.99,
    discount: 0,
    isPopular: true
  },
  {
    id: 4,
    title: 'Midnight Drift Racing',
    image: '/images/game_cover_4_1779371291390.png',
    tags: ['Гонки', 'Симулятор', 'Спорт'],
    price: 49.99,
    discount: 50,
    isPopular: true
  },
  {
    id: 5,
    title: 'Operation: Blackout FPS',
    image: '/images/game_cover_5_1779374435927.png',
    tags: ['Шутер', 'FPS', 'Экшен'],
    price: 34.99,
    discount: 0,
    isPopular: true
  },
  {
    id: 6,
    title: 'Wasteland Survivor',
    image: '/images/game_cover_1_1779370353557.png',
    tags: ['Выживание', 'Постапокалипсис', 'Зомби'],
    price: 29.99,
    discount: 15,
    isPopular: false
  },
  {
    id: 7,
    title: 'Anime Fantasy: The Last Crystal',
    image: '/images/game_cover_2_1779370687406.png',
    tags: ['Аниме', 'JRPG', 'Магия'],
    price: 45.99,
    discount: 0,
    isPopular: true
  },
  {
    id: 8,
    title: 'Asylum 404',
    image: '/images/game_cover_4_1779371291390.png',
    tags: ['Хоррор', 'Психологический', 'Выживание'],
    price: 19.99,
    discount: 30,
    isPopular: false
  }
];

// Данные постов сообщества (мок-данные)
const communityPosts = [
  {
    id: 1,
    author: 'CyberNinja_99',
    time: '2 часа назад',
    content: 'Только что прошел Neon Cyberpunk 2077 на платину! Концовка просто взрывает мозг. Всем советую собирать катаны с самого начала.',
    likes: 124,
    comments: 45
  },
  {
    id: 2,
    author: 'Nexus Official',
    time: '5 часов назад',
    content: '🎉 Вышли новые скидки на выходные! Не пропустите Midnight Drift Racing за полцены. Встретимся на трассе!',
    likes: 892,
    comments: 112
  },
  {
    id: 3,
    author: 'DragonSlayer',
    time: 'Вчера в 18:30',
    content: 'Кто-нибудь знает, как победить второго босса в Elden Dragons? Я умираю уже 20-й раз подряд...',
    likes: 34,
    comments: 89
  }
];

// --- СОСТОЯНИЕ ИЗ LOCAL STORAGE ---
let cart = JSON.parse(localStorage.getItem('nexus_cart')) || [];
let userLibrary = JSON.parse(localStorage.getItem('nexus_library')) || [];
let currentUser = JSON.parse(localStorage.getItem('nexus_user')) || null;

function saveData() {
  localStorage.setItem('nexus_cart', JSON.stringify(cart));
  localStorage.setItem('nexus_library', JSON.stringify(userLibrary));
  localStorage.setItem('nexus_user', JSON.stringify(currentUser));
}

// --- УВЕДОМЛЕНИЯ (TOASTS) ---
function showNotification(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Иконка в зависимости от типа
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  // Анимация появления
  setTimeout(() => toast.classList.add('show'), 10);

  // Удаление через 3 секунды
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300); // Ждем завершения анимации CSS
  }, 3000);
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  renderGames();
  renderLibrary();
  renderCommunity();
  setupCartModal();
  setupProfileView();
  updateHeaderAvatar();
  
  // Обновляем бейджик корзины при загрузке
  const cartBadge = document.getElementById('cart-count');
  if (cartBadge) cartBadge.innerText = cart.length;
});

// Навигация (SPA)
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const viewSections = document.querySelectorAll('.view-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      navLinks.forEach(l => l.classList.remove('active'));
      viewSections.forEach(section => section.classList.remove('active'));
      
      link.classList.add('active');
      
      const targetId = link.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
      
      // Если переходим в профиль, обновляем данные перед показом
      if (targetId === 'view-profile') {
        renderProfileState();
      }
      
      window.scrollTo(0, 0);
    });
  });
}

// Рендеринг карточек игр в магазине
function renderGames() {
  const popularContainer = document.getElementById('popular-games');
  const saleContainer = document.getElementById('sale-games');

  if (!popularContainer || !saleContainer) return;

  let popularHTML = '';
  let saleHTML = '';

  gamesData.forEach(game => {
    let finalPrice = game.price;
    let priceHTML = `<span>$${game.price}</span>`;
    
    if (game.discount > 0) {
      finalPrice = (game.price * (1 - game.discount / 100)).toFixed(2);
      priceHTML = `
        <span class="old-price">$${game.price}</span>
        <span class="price discount">$${finalPrice}</span>
      `;
    }

    const tagsHTML = game.tags.map(tag => `<span class="game-tag">${tag}</span>`).join('');

    const cardHTML = `
      <div class="game-card">
        <div style="overflow: hidden;">
          <img src="${game.image}" alt="${game.title}" class="game-image">
        </div>
        <div class="game-info">
          <h3 class="game-title">${game.title}</h3>
          <div class="game-tags">
            ${tagsHTML}
          </div>
          <div class="game-footer">
            <div class="price">
              ${priceHTML}
            </div>
            <button class="add-to-cart" data-id="${game.id}">+ В корзину</button>
          </div>
        </div>
      </div>
    `;

    if (game.isPopular) {
      popularHTML += cardHTML;
    }
    
    if (game.discount > 0) {
      saleHTML += cardHTML;
    }
  });

  popularContainer.innerHTML = popularHTML;
  saleContainer.innerHTML = saleHTML;
}

// Рендеринг Библиотеки
function renderLibrary() {
  const libraryContainer = document.getElementById('library-games');
  if (!libraryContainer) return;

  if (userLibrary.length === 0) {
    libraryContainer.innerHTML = '<div class="empty-cart-message" style="grid-column: 1 / -1; text-align: left;">У вас пока нет купленных игр. Перейдите в Магазин!</div>';
    return;
  }

  let html = '';
  userLibrary.forEach(game => {
    html += `
      <div class="game-card" style="cursor: default;">
        <div style="overflow: hidden;">
          <img src="${game.image}" alt="${game.title}" class="game-image">
        </div>
        <div class="game-info">
          <h3 class="game-title">${game.title}</h3>
          <div class="game-footer" style="margin-top: 1rem;">
            <button class="btn btn-primary w-100 play-game-btn" data-title="${game.title}">▶ Играть</button>
          </div>
        </div>
      </div>
    `;
  });

  libraryContainer.innerHTML = html;
  
  // Добавляем обработчики для кнопок "Играть"
  document.querySelectorAll('.play-game-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = e.target.getAttribute('data-title');
      showNotification(`Запуск игры ${title}...`, 'info');
    });
  });
}

// Рендеринг Сообщества
function renderCommunity() {
  const feedContainer = document.getElementById('community-feed');
  if (!feedContainer) return;

  let html = '';
  communityPosts.forEach(post => {
    html += `
      <div class="community-post">
        <div class="post-header">
          <div class="post-avatar"></div>
          <div>
            <div class="post-author">${post.author}</div>
            <div class="post-time">${post.time}</div>
          </div>
        </div>
        <div class="post-content">
          ${post.content}
        </div>
        <div class="post-actions">
          <button class="post-action-btn">❤️ ${post.likes}</button>
          <button class="post-action-btn">💬 ${post.comments}</button>
          <button class="post-action-btn">↪ Поделиться</button>
        </div>
      </div>
    `;
  });

  feedContainer.innerHTML = html;
}

// Настройка логики корзины (Сайдбар)
function setupCartModal() {
  const cartOverlay = document.getElementById('cart-sidebar-overlay');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOpenBtn = document.getElementById('cart-open-btn');
  const cartCloseBtn = document.getElementById('close-cart-btn');
  const checkoutBtn = document.getElementById('checkout-btn');

  cartOpenBtn.addEventListener('click', () => {
    renderCart(); // Рендерим перед открытием
    cartOverlay.classList.add('active');
    cartSidebar.classList.add('active');
  });

  cartCloseBtn.addEventListener('click', () => closeCart());
  cartOverlay.addEventListener('click', () => closeCart());

  function closeCart() {
    cartOverlay.classList.remove('active');
    cartSidebar.classList.remove('active');
  }

  // Оформление заказа
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showNotification('Ваша корзина пуста!', 'error');
      return;
    }
    
    // Если пользователь не авторизован, просим войти
    if (!currentUser) {
      showNotification('Пожалуйста, авторизуйтесь для покупки', 'error');
      closeCart();
      document.querySelector('[data-target="view-profile"]').click();
      return;
    }
    
    // Переносим игры в библиотеку (избегая дубликатов)
    let addedCount = 0;
    cart.forEach(cartItem => {
      if (!userLibrary.find(item => item.id === cartItem.id)) {
        userLibrary.push(cartItem);
        addedCount++;
      }
    });

    showNotification(`Заказ оформлен! Добавлено игр: ${addedCount}`, 'success');

    // Очищаем корзину, сохраняем данные и обновляем UI
    cart = [];
    saveData();
    renderCart();
    renderLibrary();
    closeCart();
    
    // Автоматически переходим в библиотеку
    document.querySelector('[data-target="view-library"]').click();
  });

  // Обработка кликов (делегирование)
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      const gameId = parseInt(e.target.getAttribute('data-id'));
      addToCart(gameId);
    }
    
    if (e.target.id === 'buy-hero-btn') {
      addToCart(1);
      renderCart();
      cartOverlay.classList.add('active');
      cartSidebar.classList.add('active');
    }

    if (e.target.classList.contains('remove-item-btn')) {
      const index = parseInt(e.target.getAttribute('data-index'));
      cart.splice(index, 1);
      saveData();
      renderCart();
    }
  });
}

function addToCart(gameId) {
  const game = gamesData.find(g => g.id === gameId);
  if (game) {
    // Проверка, есть ли уже игра в библиотеке
    if (userLibrary.find(g => g.id === gameId)) {
      showNotification('Эта игра уже есть в вашей библиотеке!', 'error');
      return;
    }
    
    // Проверка, есть ли уже игра в корзине
    if (cart.find(g => g.id === gameId)) {
      showNotification('Игра уже добавлена в корзину!', 'error');
      return;
    }

    cart.push({ ...game });
    saveData();
    showNotification(`Игра "${game.title}" добавлена в корзину`, 'success');
    
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
      cartBadge.innerText = cart.length;
      cartBadge.style.transform = 'scale(1.5)';
      setTimeout(() => {
        cartBadge.style.transform = 'scale(1)';
      }, 200);
    }
  }
}

function renderCart() {
  const cartContainer = document.getElementById('cart-items-container');
  const cartBadge = document.getElementById('cart-count');
  const totalPriceEl = document.getElementById('cart-total-price');
  
  if (cartBadge) {
    cartBadge.innerText = cart.length;
  }

  if (cart.length === 0) {
    cartContainer.innerHTML = '<div class="empty-cart-message">Ваша корзина пуста</div>';
    totalPriceEl.innerText = '$0.00';
    return;
  }

  let cartHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    let finalPrice = item.price;
    if (item.discount > 0) {
      finalPrice = item.price * (1 - item.discount / 100);
    }
    total += finalPrice;

    cartHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">$${finalPrice.toFixed(2)}</div>
          <button class="remove-item-btn" data-index="${index}">Удалить</button>
        </div>
      </div>
    `;
  });

  cartContainer.innerHTML = cartHTML;
  totalPriceEl.innerText = `$${total.toFixed(2)}`;
}

// --- ЛОГИКА СТРАНИЦЫ ПРОФИЛЯ ---
function setupProfileView() {
  const authForm = document.getElementById('profile-auth-form');
  const toggleBtn = document.getElementById('toggle-profile-auth-btn');
  const toggleText = document.getElementById('toggle-profile-auth-text');
  const authTitle = document.getElementById('profile-auth-title');
  const authSubtitle = document.getElementById('profile-auth-subtitle');
  const nameGroup = document.getElementById('profile-name-group');
  const submitBtn = document.getElementById('submit-profile-auth-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  let isLogin = true;

  // Переключение Вход / Регистрация
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    
    if (isLogin) {
      authTitle.innerText = 'Вход';
      authSubtitle.innerText = 'С возвращением в Nexus Games';
      nameGroup.style.display = 'none';
      document.getElementById('profile-username').removeAttribute('required');
      submitBtn.innerText = 'Войти';
      toggleText.innerHTML = 'Нет аккаунта? <a href="#" id="toggle-profile-auth-btn" style="color: var(--secondary-color);">Зарегистрироваться</a>';
    } else {
      authTitle.innerText = 'Регистрация';
      authSubtitle.innerText = 'Присоединяйтесь к нашему сообществу';
      nameGroup.style.display = 'block';
      document.getElementById('profile-username').setAttribute('required', 'true');
      submitBtn.innerText = 'Создать аккаунт';
      toggleText.innerHTML = 'Уже есть аккаунт? <a href="#" id="toggle-profile-auth-btn" style="color: var(--secondary-color);">Войти</a>';
    }
    
    // Re-bind click event
    document.getElementById('toggle-profile-auth-btn').addEventListener('click', toggleBtn.onclick);
  });
  
  // Отправка формы авторизации
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('profile-email').value;
    const nameInput = document.getElementById('profile-username').value;
    const username = isLogin ? email.split('@')[0] : nameInput; // Простая имитация имени для логина
    
    // Сохраняем пользователя в сессию (localStorage)
    currentUser = {
      name: username,
      email: email,
      joined: new Date().toLocaleDateString()
    };
    saveData();
    
    showNotification(isLogin ? 'Успешный вход!' : 'Аккаунт успешно создан!', 'success');
    authForm.reset();
    
    // Обновляем UI профиля и шапки
    renderProfileState();
    updateHeaderAvatar();
  });

  // Выход из аккаунта
  logoutBtn.addEventListener('click', () => {
    currentUser = null;
    saveData();
    showNotification('Вы вышли из аккаунта', 'info');
    renderProfileState();
    updateHeaderAvatar();
  });

  // Редактирование профиля (заглушка)
  const editBtn = document.getElementById('edit-profile-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      showNotification('Редактирование профиля в разработке!', 'info');
    });
  }
}

function renderProfileState() {
  const authContainer = document.getElementById('auth-container');
  const userInfoContainer = document.getElementById('user-info-container');
  
  if (currentUser) {
    // Пользователь авторизован
    authContainer.style.display = 'none';
    userInfoContainer.style.display = 'block';
    
    // Подсчет потраченных денег
    let totalSpent = 0;
    userLibrary.forEach(item => {
      let finalPrice = item.price;
      if (item.discount > 0) {
        finalPrice = item.price * (1 - item.discount / 100);
      }
      totalSpent += finalPrice;
    });
    
    // Вычисление уровня
    const level = 1 + Math.floor(userLibrary.length / 2);
    
    // Заполняем данные пользователя
    document.getElementById('user-display-name').innerText = currentUser.name;
    document.getElementById('user-display-email').innerText = currentUser.email;
    document.getElementById('user-games-count').innerText = userLibrary.length;
    
    const spentEl = document.getElementById('user-total-spent');
    if (spentEl) spentEl.innerText = `$${totalSpent.toFixed(2)}`;
    
    const joinEl = document.getElementById('user-join-date');
    if (joinEl) joinEl.innerText = currentUser.joined || new Date().toLocaleDateString();
    
    const levelBadge = document.getElementById('user-level-badge');
    if (levelBadge) levelBadge.innerText = `Уровень ${level}`;
    
    // Первая буква имени в большую аватарку
    document.getElementById('user-big-avatar').innerText = currentUser.name.charAt(0).toUpperCase();
  } else {
    // Пользователь не авторизован
    authContainer.style.display = 'block';
    userInfoContainer.style.display = 'none';
  }
}

function updateHeaderAvatar() {
  const headerAvatar = document.getElementById('header-avatar');
  if (!headerAvatar) return;
  
  if (currentUser) {
    headerAvatar.style.background = 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))';
    headerAvatar.innerText = currentUser.name.charAt(0).toUpperCase();
    headerAvatar.style.display = 'flex';
    headerAvatar.style.alignItems = 'center';
    headerAvatar.style.justifyContent = 'center';
    headerAvatar.style.color = 'white';
    headerAvatar.style.fontWeight = 'bold';
  } else {
    headerAvatar.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
    headerAvatar.innerText = '';
  }
}
