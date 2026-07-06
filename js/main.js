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


/* --- Contact Form Validation & Submission --- */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    
    if (form) {
        // Enterキーによる誤送信の防止 (textarea以外)
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            let firstErrorEl = null;

            // エラー状態のリセット
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('has-error');
            });

            // バリデーションチェック関数
            const setError = (element) => {
                isValid = false;
                element.closest('.form-group').classList.add('has-error');
                if (!firstErrorEl) firstErrorEl = element.closest('.form-group');
            };

            // 必須テキスト/メール/テキストエリアのチェック
            const requiredInputs = form.querySelectorAll('input[required], textarea[required]');
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    setError(input);
                } else if (input.type === 'email') {
                    // 簡単なメールアドレス形式チェック
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(input.value)) {
                        setError(input);
                    }
                }
            });

            // ご相談項目（チェックボックス）の必須チェック
            const checkboxes = form.querySelectorAll('input[name="entry.1222402986"]');
            if (checkboxes.length > 0) {
                const isChecked = Array.from(checkboxes).some(cb => cb.checked);
                if (!isChecked) {
                    setError(checkboxes[0]);
                }
            }

            // エラーがあれば最初の項目へスクロールして処理を中断
            if (!isValid) {
                const headerOffset = 100;
                const elementPosition = firstErrorEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
                return;
            }

            // 送信中のUI変更（ボタンのローディング表示＆二重送信防止）
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.classList.add('is-loading');
            submitBtn.disabled = true;

            // フォームデータの取得とGoogleフォーム仕様への変換
            const formData = new FormData(form);
            const params = new URLSearchParams();

            // FormDataの中身をURLSearchParamsに詰め直す（チェックボックスの複数選択にも対応）
            for (const [key, value] of formData.entries()) {
                params.append(key, value);
            }

            const actionUrl = form.getAttribute('action');

            // fetch APIを使ってGoogle Formへバックグラウンド送信
            fetch(actionUrl, {
                method: 'POST',
                body: params, // 詰め直したparamsを送信する
                mode: 'no-cors' // Google Form送信時の必須設定
            })
            .then(() => {
                // 送信成功後にサンクスページへ遷移
                window.location.href = 'thanks.html';
            })
            .catch((error) => {
                // 万が一の通信エラー時
                console.error('送信エラー:', error);
                alert('通信エラーが発生しました。時間をおいて再度お試しください。');
                submitBtn.classList.remove('is-loading');
                submitBtn.disabled = false;
            });
        });
    }
});