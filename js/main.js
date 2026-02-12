// スクロールバーの幅を取得する関数
const getScrollbarWidth = () => {
    // 一時的なdivを作成してスクロールバーの幅を測定
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    outer.style.msOverflowStyle = 'scrollbar'; // IE用
    document.body.appendChild(outer);
    
    const inner = document.createElement('div');
    outer.appendChild(inner);
    
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    
    outer.parentNode.removeChild(outer);
    return scrollbarWidth;
};

// 背景スクロールを無効化する関数
const disableBodyScroll = () => {
    // スクロールバーの幅を取得
    const scrollbarWidth = getScrollbarWidth();
    // スクロールバーの幅分のパディングを追加してレイアウトのずれを防ぐ
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';
};

// 背景スクロールを有効化する関数
const enableBodyScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
};

// ハンバーガーメニューの開閉制御
const setupHamburgerMenu = ({ buttonSelector, navSelector, linkSelector }) => {
    const button = document.querySelector(buttonSelector);
    const navEl = document.querySelector(navSelector);
    if (!button || !navEl) return;

    const setExpanded = (expanded) => {
        // aria-expanded はHTML側で付与されている場合のみ更新する
        if (button.hasAttribute('aria-expanded')) {
            button.setAttribute('aria-expanded', String(expanded));
        }
    };

    const openMenu = () => {
        button.classList.add('active');
        navEl.classList.add('active');
        setExpanded(true);
        disableBodyScroll();
    };

    const closeMenu = () => {
        button.classList.remove('active');
        navEl.classList.remove('active');
        setExpanded(false);
        enableBodyScroll();
    };

    const toggleMenu = () => {
        const isActive = button.classList.toggle('active');
        navEl.classList.toggle('active');
        setExpanded(isActive);

        if (isActive) {
            disableBodyScroll();
        } else {
            enableBodyScroll();
        }
    };

    button.addEventListener('click', toggleMenu);

    // メニューリンクをクリックしたときにメニューを閉じる
    const links = document.querySelectorAll(linkSelector);
    links.forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    // ESCで閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && (button.classList.contains('active') || navEl.classList.contains('active'))) {
            closeMenu();
        }
    });
};

// トップページ用
setupHamburgerMenu({
    buttonSelector: 'header:not(.page-header) .hamburger-menu',
    navSelector: 'header:not(.page-header) nav',
    linkSelector: 'header:not(.page-header) nav ul a',
});

// 詳細ページ用
setupHamburgerMenu({
    buttonSelector: '.page-header .hamburger-menu',
    navSelector: '.page-navigation',
    linkSelector: '.page-navigation ul a',
});

/**
 * IntersectionObserver を使ったフェードイン処理を共通化
 * @param {Element|NodeListOf<Element>|Element[]} targets
 */
const addFadeInOnIntersect = (targets) => {
    const elements = targets instanceof NodeList || Array.isArray(targets)
        ? Array.from(targets).filter(Boolean)
        : [targets].filter(Boolean);

    if (!elements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });

    elements.forEach(el => observer.observe(el));
};

// ABOUTとCONTACTのsection-titleの下からフェードインアニメーション
addFadeInOnIntersect(document.querySelectorAll('#profile .section-title, #contact .section-title'));

// profile-imageの左からフェードインアニメーション
addFadeInOnIntersect(document.querySelector('.profile-image'));

// profile-nameとtools-containerの下からフェードインアニメーション
addFadeInOnIntersect([
    document.querySelector('.profile-name'),
    document.querySelector('.tools-container')
]);

// tools-container内のh4とpタグの下からフェードインアニメーション
addFadeInOnIntersect([
    document.querySelector('.tools-container h4'),
    document.querySelector('.tools-container p')
]);

// profile-text内のpタグの下からフェードインアニメーション
addFadeInOnIntersect(document.querySelector('.profile-text p'));

