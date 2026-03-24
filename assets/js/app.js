// ===========================
// STATE & DOM ELEMENTS
// ===========================

let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let displayedProductsCount = 0;
const PRODUCTS_PER_PAGE = 8;

const productGrid = document.getElementById('productGrid');
const categoryFilters = document.getElementById('categoryFilters');
const searchInput = document.getElementById('searchInput');
const productCount = document.getElementById('productCount');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const emptyState = document.getElementById('emptyState');
const seeMoreContainer = document.getElementById('seeMoreContainer');
const seeMoreBtn = document.getElementById('seeMoreBtn');

// ===========================
// INITIALIZE APP
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// ===========================
// FETCH PRODUCTS
// ===========================

async function loadProducts() {
    try {
        loading.style.display = 'block';
        error.style.display = 'none';

        const response = await fetch('data/products.json');

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        allProducts = await response.json();
        filteredProducts = allProducts;

        loading.style.display = 'none';

        renderCategoryFilters();
        renderProducts();
        updateProductCount();

    } catch (err) {
        console.error('Error loading products:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
    }
}

// ===========================
// RENDER CATEGORY FILTERS
// ===========================

function renderCategoryFilters() {
    // Extract unique categories
    const categories = ['all', ...new Set(allProducts.map(product => product.category))];

    categoryFilters.innerHTML = '';

    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = `filter-btn ${category === currentCategory ? 'active' : ''}`;
        button.textContent = category === 'all' ? 'All' : category;
        button.dataset.category = category;

        button.addEventListener('click', () => {
            currentCategory = category;
            filterProducts();
            updateActiveFilter();
        });

        categoryFilters.appendChild(button);
    });
}

// ===========================
// UPDATE ACTIVE FILTER BUTTON
// ===========================

function updateActiveFilter() {
    const buttons = categoryFilters.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if (btn.dataset.category === currentCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ===========================
// FILTER PRODUCTS
// ===========================

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    filteredProducts = allProducts.filter(product => {
        // Category filter
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;

        // Search filter (brand or name)
        const matchesSearch = searchTerm === '' ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.name.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    // Reset pagination when filter changes
    displayedProductsCount = 0;
    renderProducts();
    updateProductCount();
}

// ===========================
// RENDER PRODUCTS
// ===========================

function renderProducts() {
    // If this is the first render, clear the grid
    if (displayedProductsCount === 0) {
        productGrid.innerHTML = '';
    }

    if (filteredProducts.length === 0) {
        emptyState.style.display = 'block';
        seeMoreContainer.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';

    // Calculate how many products to show
    const productsToShow = Math.min(
        displayedProductsCount + PRODUCTS_PER_PAGE,
        filteredProducts.length
    );

    // Render new products
    for (let i = displayedProductsCount; i < productsToShow; i++) {
        const card = createProductCard(filteredProducts[i]);
        productGrid.appendChild(card);
    }

    // Update displayed count
    displayedProductsCount = productsToShow;

    // Show/hide see more button
    if (displayedProductsCount < filteredProducts.length) {
        seeMoreContainer.style.display = 'flex';
    } else {
        seeMoreContainer.style.display = 'none';
    }
}

// ===========================
// CREATE PRODUCT CARD
// ===========================

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const formattedPrice = formatPrice(product.price, product.currency);

    // Handle both single image (legacy) and multiple images
    const images = product.images || [product.image || product.primaryImage];
    const primaryImage = product.primaryImage || images[0];
    const hasMultipleImages = images.length > 1;

    // Build image carousel HTML with lazy loading
    let imageHTML = '';
    if (hasMultipleImages) {
        imageHTML = `
            <div class="product-image-container">
                <div class="image-placeholder"></div>
                <img 
                    src="${primaryImage}" 
                    alt="${product.brand} ${product.name}" 
                    class="product-image"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/280x280?text=No+Image'"
                    onload="this.classList.add('loaded')"
                    data-images='${JSON.stringify(images)}'
                    data-current-index="0"
                >
                <div class="image-dots">
                    ${images.map((_, index) => `<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`).join('')}
                </div>
            </div>
        `;
    } else {
        imageHTML = `
            <div class="product-image-container">
                <div class="image-placeholder"></div>
                <img 
                    src="${primaryImage}" 
                    alt="${product.brand} ${product.name}" 
                    class="product-image"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/280x280?text=No+Image'"
                    onload="this.classList.add('loaded')"
                >
            </div>
        `;
    }

    card.innerHTML = `
        ${imageHTML}
        <div class="product-info">
            <div class="product-brand">${escapeHtml(product.brand)}</div>
            <div class="product-name">${escapeHtml(product.name)}</div>
            <div class="product-price">${formattedPrice}</div>
        </div>
    `;

    // Add carousel functionality for multi-image products
    if (hasMultipleImages) {
        setupImageCarousel(card, images);
    }

    // Add click event to open modal
    card.addEventListener('click', () => {
        openProductModal(product);
    });

    return card;
}

// ===========================
// FORMAT PRICE
// ===========================

function formatPrice(price, currency = 'NZD') {
    const symbol = currency === 'NZD' ? 'NZ$' : '$';
    return `${symbol}${price.toFixed(2)}`;
}

// ===========================
// SETUP IMAGE CAROUSEL
// ===========================

function setupImageCarousel(card, images) {
    const img = card.querySelector('.product-image');
    const dots = card.querySelectorAll('.dot');
    let currentIndex = 0;
    let autoPlayInterval;

    function showImage(index) {
        currentIndex = index;
        img.src = images[index];
        img.dataset.currentIndex = index;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function nextImage() {
        const nextIndex = (currentIndex + 1) % images.length;
        showImage(nextIndex);
    }

    // Click image to cycle through
    img.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
    });

    // Click dots to jump to specific image
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(dot.dataset.index);
            showImage(index);
        });
    });

    // Auto-play on hover (optional)
    card.addEventListener('mouseenter', () => {
        autoPlayInterval = setInterval(nextImage, 2000);
    });

    card.addEventListener('mouseleave', () => {
        clearInterval(autoPlayInterval);
        showImage(0); // Reset to first image
    });
}

// ===========================
// UPDATE PRODUCT COUNT
// ===========================

function updateProductCount() {
    const count = filteredProducts.length;
    const total = allProducts.length;

    if (currentCategory === 'all' && searchInput.value === '') {
        productCount.textContent = `Showing all ${total} products`;
    } else {
        productCount.textContent = `Showing ${count} of ${total} products`;
    }
}

// ===========================
// ESCAPE HTML (Security)
// ===========================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===========================
// SETUP EVENT LISTENERS
// ===========================

function setupEventListeners() {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    const heroSection = document.getElementById('home');

    window.addEventListener('scroll', () => {
        if (heroSection) {
            const heroHeight = heroSection.offsetHeight;
            const scrollPosition = window.scrollY;

            // Add 'scrolled' class when scrolled past 80% of hero section
            if (scrollPosition > heroHeight * 0.8) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Hamburger menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Close menu when clicking on a nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Search input with debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterProducts();
        }, 300);
    });

    // See More button
    seeMoreBtn.addEventListener('click', () => {
        renderProducts();
        updateProductCount();

        // Smooth scroll to show new products
        setTimeout(() => {
            const lastVisibleCard = productGrid.children[displayedProductsCount - PRODUCTS_PER_PAGE];
            if (lastVisibleCard) {
                lastVisibleCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Smooth scroll for CTA button
    const ctaButton = document.querySelector('.btn-primary');
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            const catalogSection = document.querySelector('#catalog');

            if (catalogSection) {
                catalogSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// ===========================
// UTILITY: Title Case
// ===========================

function toTitleCase(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ===========================
// PRODUCT DETAIL MODAL
// ===========================

const modal = document.getElementById('productModal');
const modalClose = document.querySelector('.modal-close');
const modalbody = document.querySelector('.modal-body');

function openProductModal(product) {
    const images = product.images || [product.image || product.primaryImage];

    const modalMainImage = document.getElementById('modalMainImage');

    // Show loading state
    modalMainImage.classList.remove('loaded');
    modalMainImage.src = images[0];
    modalMainImage.alt = `${product.brand} ${product.name}`;

    // Add load event
    modalMainImage.onload = function () {
        this.classList.add('loaded');
    };

    // Set thumbnails
    const thumbnailsContainer = document.getElementById('modalThumbnails');
    thumbnailsContainer.innerHTML = '';

    if (images.length > 1) {
        images.forEach((img, index) => {
            const thumb = document.createElement('img');
            thumb.src = img;
            thumb.alt = `View ${index + 1}`;
            thumb.className = `modal-thumbnail ${index === 0 ? 'active' : ''}`;
            thumb.loading = 'lazy'; // Lazy load thumbnails
            thumb.addEventListener('click', () => {
                modalMainImage.classList.remove('loaded');
                modalMainImage.src = img;
                modalMainImage.onload = function () {
                    this.classList.add('loaded');
                };
                thumbnailsContainer.querySelectorAll('.modal-thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
            thumbnailsContainer.appendChild(thumb);
        });
    }

    // Set product info
    document.getElementById('modalBrand').textContent = product.brand;
    document.getElementById('modalName').textContent = product.name;
    document.getElementById('modalPrice').textContent = formatPrice(product.price, product.currency);

    // Set description
    const descContainer = document.getElementById('modalDescription');
    if (product.description) {
        descContainer.textContent = product.description;
        descContainer.style.display = 'block';
    } else {
        descContainer.style.display = 'none';
    }

    // Set sizes
    const sizesContainer = document.getElementById('modalSizes');
    const sizeList = document.getElementById('modalSizeList');
    if (product.sizes && product.sizes.length > 0) {
        sizeList.innerHTML = '';
        product.sizes.forEach(size => {
            const badge = document.createElement('span');
            badge.className = 'size-badge';
            badge.textContent = size;
            sizeList.appendChild(badge);
        });
        sizesContainer.style.display = 'block';
    } else {
        sizesContainer.style.display = 'none';
    }

    // Set notes
    const notesContainer = document.getElementById('modalNotes');
    const notesList = document.getElementById('modalNotesList');
    if (product.notes && product.notes.length > 0) {
        notesList.innerHTML = '';
        product.notes.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note;
            notesList.appendChild(li);
        });
        notesContainer.style.display = 'block';
    } else {
        notesContainer.style.display = 'none';
    }

    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close button click
modalClose.addEventListener('click', closeProductModal);

// Click outside modal
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeProductModal();
    }
});

// ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeProductModal();
    }
});
