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

// ハンバーガーメニューの開閉制御（トップページ用）
const hamburgerMenu = document.querySelector('header:not(.page-header) .hamburger-menu');
const nav = document.querySelector('header:not(.page-header) nav');

if (hamburgerMenu && nav) {
    hamburgerMenu.addEventListener('click', () => {
        const isActive = hamburgerMenu.classList.toggle('active');
        nav.classList.toggle('active');
        
        if (isActive) {
            disableBodyScroll();
        } else {
            enableBodyScroll();
        }
    });

    // メニューリンクをクリックしたときにメニューを閉じる
    const navLinks = document.querySelectorAll('header:not(.page-header) nav ul a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            nav.classList.remove('active');
            enableBodyScroll();
        });
    });
}

// ページナビゲーションのハンバーガーメニューの開閉制御（詳細ページ用）
const pageHamburgerMenu = document.querySelector('.page-header .hamburger-menu');
const pageNav = document.querySelector('.page-navigation');

if (pageHamburgerMenu && pageNav) {
    pageHamburgerMenu.addEventListener('click', () => {
        const isActive = pageHamburgerMenu.classList.toggle('active');
        pageNav.classList.toggle('active');
        
        if (isActive) {
            disableBodyScroll();
        } else {
            enableBodyScroll();
        }
    });

    // メニューリンクをクリックしたときにメニューを閉じる
    const pageNavLinks = document.querySelectorAll('.page-navigation ul a');
    pageNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            pageHamburgerMenu.classList.remove('active');
            pageNav.classList.remove('active');
            enableBodyScroll();
        });
    });
}

/**
 * IntersectionObserver を使ったフェードイン処理を共通化
 * @param {Element|NodeListOf<Element>|Element[]} targets - 監視対象要素
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

// work-detail.html: 947px以上でmain-imageとsub-imagesの1枚目の開始位置を揃える
const alignImagePositions = () => {
    const detailContainer = document.querySelector('.detail-container');
    const projectInfo = document.querySelector('.detail-left .project-info');
    const projectDescription = document.querySelector('.project-description.desktop-only');
    const mainImage = document.querySelector('.detail-left .main-image');
    const subImages = document.querySelector('.detail-right .sub-images');
    
    if (!detailContainer || !projectInfo || !projectDescription || !mainImage || !subImages) {
        return;
    }
    
    if (window.innerWidth >= 947) {
        // リセット
        projectDescription.style.marginTop = '';
        subImages.style.marginTop = '';
        
        // コンテナの位置を基準に取得
        const containerRect = detailContainer.getBoundingClientRect();
        const mainImageRect = mainImage.getBoundingClientRect();
        const subImagesRect = subImages.getBoundingClientRect();
        
        // コンテナを基準にした相対位置を計算
        const mainImageTopRelative = mainImageRect.top - containerRect.top;
        const subImagesTopRelative = subImagesRect.top - containerRect.top;
        
        // 位置の差を計算
        const difference = mainImageTopRelative - subImagesTopRelative;
        
        if (Math.abs(difference) > 1) { // 1px以上の差がある場合のみ調整
            if (difference > 0) {
                // main-imageの方が下にある場合、sub-imagesを下に移動
                subImages.style.marginTop = `${difference}px`;
            } else {
                // sub-imagesの方が下にある場合、project-descriptionを下に移動
                projectDescription.style.marginTop = `${Math.abs(difference)}px`;
            }
        }
    } else {
        // 947px未満の場合はリセット
        projectDescription.style.marginTop = '';
        subImages.style.marginTop = '';
    }
};

// 画像の読み込み完了を待つ関数
const waitForImages = (callback) => {
    const detailContainer = document.querySelector('.detail-container');
    if (!detailContainer) {
        callback();
        return;
    }
    
    const images = detailContainer.querySelectorAll('img');
    if (images.length === 0) {
        callback();
        return;
    }
    
    let loadedCount = 0;
    const totalImages = images.length;
    
    const checkComplete = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
            // すべての画像が読み込まれた後、少し遅延させてレンダリングを待つ
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    callback();
                });
            });
        }
    };
    
    images.forEach(img => {
        if (img.complete) {
            checkComplete();
        } else {
            img.addEventListener('load', checkComplete, { once: true });
            img.addEventListener('error', checkComplete, { once: true });
        }
    });
};

// ページ読み込み時とリサイズ時に実行
if (document.querySelector('.detail-container')) {
    // 画像の読み込み完了を待ってから位置調整を実行
    const initAlignImagePositions = () => {
        waitForImages(() => {
            alignImagePositions();
        });
    };
    
    // DOMContentLoadedで実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAlignImagePositions);
    } else {
        initAlignImagePositions();
    }
    
    // リサイズ時に実行（デバウンス処理）
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            waitForImages(() => {
                alignImagePositions();
            });
        }, 150);
    });
}


