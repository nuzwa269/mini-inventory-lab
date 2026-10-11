/**
 * Mini Inventory Lab - Main Application Logic
 * Generated via OpenRouter Free Models
 * Complete, responsive inventory management with LocalStorage persistence.
 */
(function() {
    'use strict';

    // --- 1. Storage & Config Keys ---
    const STORAGE_KEY = 'mini_inventory_lab_products';

    const SEED_DATA = [
        {
            id: 'prod-101',
            name: 'Ergonomic Mesh Chair',
            sku: 'FURN-CHR-01',
            category: 'Furniture',
            price: 249.99,
            quantity: 14,
            threshold: 5,
            notes: 'Aisle 2, Bin A'
        },
        {
            id: 'prod-102',
            name: 'Mechanical Keyboard RGB',
            sku: 'ELEC-KB-02',
            category: 'Electronics',
            price: 89.50,
            quantity: 3,
            threshold: 5,
            notes: 'Shelf 4 (Low Stock Warning)'
        },
        {
            id: 'prod-103',
            name: 'UltraWide Monitor 34"',
            sku: 'ELEC-MON-03',
            category: 'Electronics',
            price: 499.00,
            quantity: 8,
            threshold: 4,
            notes: 'Top rack warehouse'
        },
        {
            id: 'prod-104',
            name: 'USB-C Fast Charging Hub',
            sku: 'ACC-HUB-04',
            category: 'Accessories',
            price: 34.99,
            quantity: 0,
            threshold: 6,
            notes: 'Out of stock - reorder placed'
        },
        {
            id: 'prod-105',
            name: 'Electric Standing Desk',
            sku: 'FURN-DSK-05',
            category: 'Furniture',
            price: 420.00,
            quantity: 5,
            threshold: 5,
            notes: 'Heavy box - 2 person lift'
        },
        {
            id: 'prod-106',
            name: 'Gel Ink Pens (12-Pack)',
            sku: 'OFF-PEN-06',
            category: 'Office Supplies',
            price: 14.50,
            quantity: 65,
            threshold: 15,
            notes: 'Stationery cabinet'
        },
        {
            id: 'prod-107',
            name: 'Wireless Bluetooth Headset',
            sku: 'ACC-EAR-07',
            category: 'Accessories',
            price: 69.95,
            quantity: 4,
            threshold: 8,
            notes: 'Display counter (Low Stock)'
        }
    ];

    // --- 2. Application State ---
    const state = {
        products: [],
        filters: {
            search: '',
            category: 'all',
            status: 'all',
            sort: 'name-asc'
        },
        currentView: 'table', // 'table' or 'grid'
        pendingDeleteId: null
    };

    // --- 3. DOM Elements Map ---
    const DOM = {
        // Metrics
        metricTotalProducts: document.getElementById('metric-total-products'),
        metricTotalUnits: document.getElementById('metric-total-units'),
        metricTotalValue: document.getElementById('metric-total-value'),
        metricLowStock: document.getElementById('metric-low-stock'),
        metricCardLowStock: document.getElementById('metric-card-low-stock'),

        // Banner
        lowStockBanner: document.getElementById('low-stock-banner'),
        lowStockCount: document.getElementById('low-stock-count'),
        btnViewLowStock: document.getElementById('btn-view-low-stock'),
        btnCloseBanner: document.getElementById('btn-close-banner'),

        // Search & Filters
        searchInput: document.getElementById('search-input'),
        categoryFilter: document.getElementById('category-filter'),
        statusFilter: document.getElementById('status-filter'),
        sortSelect: document.getElementById('sort-select'),
        btnClearFilters: document.getElementById('btn-clear-filters'),

        // Listings & Views
        tableContainer: document.getElementById('table-container'),
        desktopTable: document.getElementById('desktop-table'),
        productsTbody: document.getElementById('products-tbody'),
        mobileCards: document.getElementById('mobile-cards'),
        emptyState: document.getElementById('empty-state'),
        recordCount: document.getElementById('record-count'),
        viewTableBtn: document.getElementById('view-table-btn'),
        viewGridBtn: document.getElementById('view-grid-btn'),

        // Header Actions
        btnExportData: document.getElementById('btn-export-data'),
        btnResetData: document.getElementById('btn-reset-data'),
        btnAddProduct: document.getElementById('btn-add-product'),
        btnAddFromEmpty: document.getElementById('btn-add-from-empty'),

        // Product Modal
        productModal: document.getElementById('product-modal'),
        modalTitle: document.getElementById('modal-title'),
        productForm: document.getElementById('product-form'),
        editProductId: document.getElementById('edit-product-id'),
        productName: document.getElementById('product-name'),
        productSku: document.getElementById('product-sku'),
        productCategory: document.getElementById('product-category'),
        productPrice: document.getElementById('product-price'),
        productQuantity: document.getElementById('product-quantity'),
        productThreshold: document.getElementById('product-threshold'),
        productNotes: document.getElementById('product-notes'),
        btnCloseModal: document.getElementById('btn-close-modal'),
        btnCancelModal: document.getElementById('btn-cancel-modal'),

        // Delete Modal
        deleteModal: document.getElementById('delete-modal'),
        deleteProductName: document.getElementById('delete-product-name'),
        btnCloseDeleteModal: document.getElementById('btn-close-delete-modal'),
        btnCancelDelete: document.getElementById('btn-cancel-delete'),
        btnConfirmDelete: document.getElementById('btn-confirm-delete'),

        // Toasts
        toastContainer: document.getElementById('toast-container')
    };

    // --- 4. Initialization ---
    function init() {
        loadData();
        setupEventListeners();
        populateCategoryFilter();
        render();
    }

    // --- 5. Data Persistence & Seed Handling ---
    function loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    state.products = parsed;
                    return;
                }
            }
        } catch (err) {
            console.error('Error loading inventory data:', err);
        }
        // Fallback to seed data
        state.products = JSON.parse(JSON.stringify(SEED_DATA));
        saveData();
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.products));
        } catch (err) {
            showToast('Unable to persist data to LocalStorage.', 'error');
        }
    }

    // --- 6. Helper: Stock Status & Calculation ---
    function getProductStatus(quantity, threshold) {
        const qty = Number(quantity);
        const th = Number(threshold);
        if (qty <= 0) return { key: 'out-of-stock', label: 'Out of Stock', class: 'badge-danger' };
        if (qty <= th) return { key: 'low-stock', label: 'Low Stock', class: 'badge-warning' };
        return { key: 'in-stock', label: 'In Stock', class: 'badge-success' };
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- 7. Filter & Sort Logic ---
    function getFilteredProducts() {
        let result = [...state.products];

        // 1. Text Search (name, sku, category, notes)
        const q = state.filters.search.trim().toLowerCase();
        if (q) {
            result = result.filter(p =>
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.sku && p.sku.toLowerCase().includes(q)) ||
                (p.category && p.category.toLowerCase().includes(q)) ||
                (p.notes && p.notes.toLowerCase().includes(q))
            );
        }

        // 2. Category Filter
        if (state.filters.category && state.filters.category !== 'all') {
            result = result.filter(p =>
                p.category && p.category.toLowerCase() === state.filters.category.toLowerCase()
            );
        }

        // 3. Status Filter
        if (state.filters.status && state.filters.status !== 'all') {
            result = result.filter(p => {
                const s = getProductStatus(p.quantity, p.threshold);
                return s.key === state.filters.status;
            });
        }

        // 4. Sort
        result.sort((a, b) => {
            switch (state.filters.sort) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return Number(a.price) - Number(b.price);
                case 'price-desc':
                    return Number(b.price) - Number(a.price);
                case 'qty-asc':
                    return Number(a.quantity) - Number(b.quantity);
                case 'qty-desc':
                    return Number(b.quantity) - Number(a.quantity);
                case 'low-stock-first': {
                    const aLow = Number(a.quantity) <= Number(a.threshold) ? 0 : 1;
                    const bLow = Number(b.quantity) <= Number(b.threshold) ? 0 : 1;
                    if (aLow !== bLow) return aLow - bLow;
                    return Number(a.quantity) - Number(b.quantity);
                }
                default:
                    return 0;
            }
        });

        return result;
    }

    // --- 8. Render Engine ---
    function render() {
        const filtered = getFilteredProducts();

        updateMetrics();
        updateLowStockBanner();
        updateRecordCount(filtered.length);

        if (filtered.length === 0) {
            DOM.emptyState.classList.remove('hidden');
            DOM.tableContainer.classList.add('hidden');
            DOM.mobileCards.classList.add('hidden');
            return;
        }

        DOM.emptyState.classList.add('hidden');

        if (state.currentView === 'table') {
            DOM.tableContainer.classList.remove('hidden');
            DOM.mobileCards.classList.add('hidden');
            renderTableRows(filtered);
        } else {
            DOM.tableContainer.classList.add('hidden');
            DOM.mobileCards.classList.remove('hidden');
            renderCards(filtered);
        }
    }

    function updateMetrics() {
        const totalProducts = state.products.length;
        const totalUnits = state.products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
        const totalValue = state.products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.quantity) || 0)), 0);
        const lowStockCount = state.products.filter(p => Number(p.quantity) <= Number(p.threshold)).length;

        DOM.metricTotalProducts.textContent = totalProducts.toLocaleString();
        DOM.metricTotalUnits.textContent = totalUnits.toLocaleString();
        DOM.metricTotalValue.textContent = formatCurrency(totalValue);
        DOM.metricLowStock.textContent = lowStockCount.toLocaleString();

        if (lowStockCount > 0) {
            DOM.metricCardLowStock.classList.add('has-alerts');
        } else {
            DOM.metricCardLowStock.classList.remove('has-alerts');
        }
    }

    function updateLowStockBanner() {
        const lowStockItems = state.products.filter(p => Number(p.quantity) <= Number(p.threshold));
        const count = lowStockItems.length;

        if (count > 0 && !state.bannerDismissed) {
            DOM.lowStockCount.textContent = count;
            DOM.lowStockBanner.classList.remove('hidden');
        } else {
            DOM.lowStockBanner.classList.add('hidden');
        }
    }

    function updateRecordCount(count) {
        DOM.recordCount.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
    }

    function populateCategoryFilter() {
        const currentCategory = state.filters.category;
        const categories = [...new Set(state.products.map(p => p.category).filter(Boolean))].sort();

        // Keep 'all'
        let html = '<option value="all">All Categories</option>';
        categories.forEach(cat => {
            const isSelected = cat.toLowerCase() === currentCategory.toLowerCase() ? 'selected' : '';
            html += `<option value="${escapeHtml(cat.toLowerCase())}" ${isSelected}>${escapeHtml(cat)}</option>`;
        });
        DOM.categoryFilter.innerHTML = html;
        DOM.categoryFilter.value = currentCategory;
    }

    function renderTableRows(products) {
        DOM.productsTbody.innerHTML = products.map(p => {
            const status = getProductStatus(p.quantity, p.threshold);
            const notesSnippet = p.notes ? `<span class="product-notes">${escapeHtml(p.notes)}</span>` : '';
            
            return `
                <tr data-id="${p.id}">
                    <td><span class="sku-cell">${escapeHtml(p.sku)}</span></td>
                    <td>
                        <span class="product-name-cell">${escapeHtml(p.name)}</span>
                        ${notesSnippet}
                    </td>
                    <td><span class="badge-category">${escapeHtml(p.category)}</span></td>
                    <td class="text-right price-cell">${formatCurrency(p.price)}</td>
                    <td class="text-center">
                        <div class="stepper-wrap">
                            <button type="button" class="stepper-btn btn-qty-minus" data-id="${p.id}" title="Decrease Stock" aria-label="Decrease Stock" ${Number(p.quantity) <= 0 ? 'disabled' : ''}>
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <span class="stepper-val">${p.quantity}</span>
                            <button type="button" class="stepper-btn btn-qty-plus" data-id="${p.id}" title="Increase Stock" aria-label="Increase Stock">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </td>
                    <td class="text-center">
                        <span class="badge ${status.class}">
                            <span class="badge-dot"></span> ${status.label}
                        </span>
                    </td>
                    <td class="text-right">
                        <div class="actions-cell">
                            <button type="button" class="action-btn edit-btn" data-id="${p.id}" title="Edit Product" aria-label="Edit Product">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button type="button" class="action-btn delete-btn" data-id="${p.id}" title="Delete Product" aria-label="Delete Product">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderCards(products) {
        DOM.mobileCards.innerHTML = products.map(p => {
            const status = getProductStatus(p.quantity, p.threshold);
            
            return `
                <div class="product-card" data-id="${p.id}">
                    <div class="card-top">
                        <div class="card-top-title">
                            <h4>${escapeHtml(p.name)}</h4>
                            <span class="sku-cell">${escapeHtml(p.sku)}</span>
                        </div>
                        <span class="badge ${status.class}">
                            <span class="badge-dot"></span> ${status.label}
                        </span>
                    </div>

                    <div class="card-details-grid">
                        <div class="card-detail-item">
                            <span class="detail-label">Category</span>
                            <span class="detail-val">${escapeHtml(p.category)}</span>
                        </div>
                        <div class="card-detail-item">
                            <span class="detail-label">Unit Price</span>
                            <span class="detail-val price-cell">${formatCurrency(p.price)}</span>
                        </div>
                        <div class="card-detail-item">
                            <span class="detail-label">Threshold</span>
                            <span class="detail-val">${p.threshold} units</span>
                        </div>
                        <div class="card-detail-item">
                            <span class="detail-label">Total Value</span>
                            <span class="detail-val">${formatCurrency(p.price * p.quantity)}</span>
                        </div>
                    </div>

                    ${p.notes ? `<div class="field-hint"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.notes)}</div>` : ''}

                    <div class="card-footer-controls">
                        <div class="stepper-wrap">
                            <button type="button" class="stepper-btn btn-qty-minus" data-id="${p.id}" title="Decrease Stock" aria-label="Decrease Stock" ${Number(p.quantity) <= 0 ? 'disabled' : ''}>
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <span class="stepper-val">${p.quantity} in stock</span>
                            <button type="button" class="stepper-btn btn-qty-plus" data-id="${p.id}" title="Increase Stock" aria-label="Increase Stock">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                        <div class="actions-cell">
                            <button type="button" class="action-btn edit-btn" data-id="${p.id}" title="Edit Product">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button type="button" class="action-btn delete-btn" data-id="${p.id}" title="Delete Product">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- 9. Stock Stepper Actions ---
    function adjustStock(productId, delta) {
        const product = state.products.find(p => p.id === productId);
        if (!product) return;

        const newQty = Math.max(0, Number(product.quantity) + delta);
        if (newQty === product.quantity && delta < 0) {
            showToast(`"${product.name}" is already at 0 stock.`, 'warning');
            return;
        }

        product.quantity = newQty;
        saveData();
        render();

        const status = getProductStatus(product.quantity, product.threshold);
        if (status.key === 'out-of-stock') {
            showToast(`Stock updated: "${product.name}" is now OUT OF STOCK!`, 'error');
        } else if (status.key === 'low-stock') {
            showToast(`Stock updated: "${product.name}" is LOW ON STOCK (${product.quantity} left).`, 'warning');
        } else {
            showToast(`Updated stock for "${product.name}" to ${product.quantity}.`, 'success');
        }
    }

    // --- 10. Product Modal Handlers ---
    function openAddModal() {
        DOM.productForm.reset();
        DOM.editProductId.value = '';
        DOM.modalTitle.textContent = 'Add New Product';
        clearFormErrors();
        DOM.productThreshold.value = 5;
        if (typeof DOM.productModal.showModal === 'function') {
            DOM.productModal.showModal();
        } else {
            DOM.productModal.setAttribute('open', '');
        }
        DOM.productName.focus();
    }

    function openEditModal(productId) {
        const product = state.products.find(p => p.id === productId);
        if (!product) return;

        DOM.productForm.reset();
        clearFormErrors();
        DOM.modalTitle.textContent = 'Edit Product';
        DOM.editProductId.value = product.id;
        DOM.productName.value = product.name;
        DOM.productSku.value = product.sku;
        DOM.productCategory.value = product.category;
        DOM.productPrice.value = product.price;
        DOM.productQuantity.value = product.quantity;
        DOM.productThreshold.value = product.threshold ?? 5;
        DOM.productNotes.value = product.notes ?? '';

        if (typeof DOM.productModal.showModal === 'function') {
            DOM.productModal.showModal();
        } else {
            DOM.productModal.setAttribute('open', '');
        }
        DOM.productName.focus();
    }

    function closeProductModal() {
        if (typeof DOM.productModal.close === 'function') {
            DOM.productModal.close();
        } else {
            DOM.productModal.removeAttribute('open');
        }
    }

    function clearFormErrors() {
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    }

    function handleProductFormSubmit(e) {
        e.preventDefault();
        clearFormErrors();

        const editId = DOM.editProductId.value.trim();
        const name = DOM.productName.value.trim();
        const sku = DOM.productSku.value.trim().toUpperCase();
        const category = DOM.productCategory.value.trim();
        const rawPrice = parseFloat(DOM.productPrice.value);
        const price = isNaN(rawPrice) ? NaN : Math.round(rawPrice * 100) / 100;
        const quantity = parseInt(DOM.productQuantity.value, 10);
        const thresholdParsed = parseInt(DOM.productThreshold.value, 10);
        const threshold = isNaN(thresholdParsed) ? 5 : Math.max(0, thresholdParsed);
        const notes = DOM.productNotes.value.trim();

        let hasError = false;

        if (!name) {
            document.getElementById('error-name').textContent = 'Product name is required.';
            hasError = true;
        }

        if (!sku) {
            document.getElementById('error-sku').textContent = 'SKU is required.';
            hasError = true;
        } else {
            // Check uniqueness (ignoring the product being edited)
            const duplicate = state.products.find(p => p.sku.toUpperCase() === sku && p.id !== editId);
            if (duplicate) {
                document.getElementById('error-sku').textContent = 'SKU already exists. Must be unique.';
                hasError = true;
            }
        }

        if (!category) {
            document.getElementById('error-category').textContent = 'Category is required.';
            hasError = true;
        }

        if (isNaN(price) || price < 0) {
            document.getElementById('error-price').textContent = 'Valid price ≥ 0 is required.';
            hasError = true;
        }

        if (isNaN(quantity) || quantity < 0) {
            document.getElementById('error-quantity').textContent = 'Valid quantity ≥ 0 is required.';
            hasError = true;
        }

        if (hasError) return;

        if (editId) {
            // Update existing
            const index = state.products.findIndex(p => p.id === editId);
            if (index !== -1) {
                state.products[index] = {
                    ...state.products[index],
                    name,
                    sku,
                    category,
                    price,
                    quantity,
                    threshold,
                    notes
                };
                showToast(`Product "${name}" updated successfully.`, 'success');
            }
        } else {
            // Create new
            const newProduct = {
                id: 'prod-' + Date.now(),
                name,
                sku,
                category,
                price,
                quantity,
                threshold,
                notes
            };
            state.products.unshift(newProduct);
            showToast(`Product "${name}" added to inventory.`, 'success');
        }

        saveData();
        populateCategoryFilter();
        render();
        closeProductModal();
    }

    // --- 11. Delete Modal Handlers ---
    function openDeleteModal(productId) {
        const product = state.products.find(p => p.id === productId);
        if (!product) return;

        state.pendingDeleteId = productId;
        DOM.deleteProductName.textContent = `"${product.name}" (${product.sku})`;

        if (typeof DOM.deleteModal.showModal === 'function') {
            DOM.deleteModal.showModal();
        } else {
            DOM.deleteModal.setAttribute('open', '');
        }
    }

    function closeDeleteModal() {
        state.pendingDeleteId = null;
        if (typeof DOM.deleteModal.close === 'function') {
            DOM.deleteModal.close();
        } else {
            DOM.deleteModal.removeAttribute('open');
        }
    }

    function confirmDelete() {
        if (!state.pendingDeleteId) return;

        const product = state.products.find(p => p.id === state.pendingDeleteId);
        const name = product ? product.name : 'Product';

        state.products = state.products.filter(p => p.id !== state.pendingDeleteId);
        saveData();
        populateCategoryFilter();
        render();
        closeDeleteModal();
        showToast(`"${name}" was deleted from inventory.`, 'info');
    }

    // --- 12. Export & Reset ---
    function exportInventory() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.products, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `mini_inventory_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Inventory JSON exported successfully.', 'success');
    }

    function resetDemoData() {
        if (!confirm('Reset all products back to default demo items? Any custom products will be overwritten.')) {
            return;
        }
        state.products = JSON.parse(JSON.stringify(SEED_DATA));
        state.bannerDismissed = false;
        state.filters = {
            search: '',
            category: 'all',
            status: 'all',
            sort: 'name-asc'
        };
        DOM.searchInput.value = '';
        DOM.statusFilter.value = 'all';
        DOM.sortSelect.value = 'name-asc';

        saveData();
        populateCategoryFilter();
        render();
        showToast('Inventory reset to initial demo dataset.', 'info');
    }

    // --- 13. Toast Notification Engine ---
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconClass = type === 'success' ? 'fa-circle-check'
            : type === 'error' ? 'fa-circle-xmark'
            : type === 'warning' ? 'fa-triangle-exclamation'
            : 'fa-circle-info';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <div class="toast-content">${escapeHtml(message)}</div>
            <button type="button" class="toast-close" aria-label="Dismiss toast">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            removeToast(toast);
        });

        DOM.toastContainer.appendChild(toast);

        // Auto remove after 3.5s
        setTimeout(() => {
            removeToast(toast);
        }, 3500);
    }

    function removeToast(toast) {
        if (!toast || toast.classList.contains('toast-hiding')) return;
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // --- 14. Event Listeners Setup ---
    function setupEventListeners() {
        // Search Input with Debounce
        let searchTimeout = null;
        DOM.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.filters.search = e.target.value;
                render();
            }, 200);
        });

        // Category Filter
        DOM.categoryFilter.addEventListener('change', (e) => {
            state.filters.category = e.target.value;
            render();
        });

        // Status Filter
        DOM.statusFilter.addEventListener('change', (e) => {
            state.filters.status = e.target.value;
            render();
        });

        // Sort Select
        DOM.sortSelect.addEventListener('change', (e) => {
            state.filters.sort = e.target.value;
            render();
        });

        // Clear Filters
        DOM.btnClearFilters.addEventListener('click', () => {
            state.filters.search = '';
            state.filters.category = 'all';
            state.filters.status = 'all';
            state.filters.sort = 'name-asc';

            DOM.searchInput.value = '';
            DOM.categoryFilter.value = 'all';
            DOM.statusFilter.value = 'all';
            DOM.sortSelect.value = 'name-asc';
            render();
            showToast('All search & category filters cleared.', 'info');
        });

        // View Toggles
        DOM.viewTableBtn.addEventListener('click', () => {
            state.currentView = 'table';
            DOM.viewTableBtn.classList.add('active');
            DOM.viewGridBtn.classList.remove('active');
            render();
        });

        DOM.viewGridBtn.addEventListener('click', () => {
            state.currentView = 'grid';
            DOM.viewGridBtn.classList.add('active');
            DOM.viewTableBtn.classList.remove('active');
            render();
        });

        // Banner View Low Stock
        DOM.btnViewLowStock.addEventListener('click', () => {
            state.filters.status = 'low-stock';
            DOM.statusFilter.value = 'low-stock';
            render();
        });

        // Banner Close
        DOM.btnCloseBanner.addEventListener('click', () => {
            state.bannerDismissed = true;
            DOM.lowStockBanner.classList.add('hidden');
        });

        // Add Product Buttons
        DOM.btnAddProduct.addEventListener('click', openAddModal);
        DOM.btnAddFromEmpty.addEventListener('click', openAddModal);

        // Product Modal Close/Cancel
        DOM.btnCloseModal.addEventListener('click', closeProductModal);
        DOM.btnCancelModal.addEventListener('click', closeProductModal);

        // Product Form Submit
        DOM.productForm.addEventListener('submit', handleProductFormSubmit);

        // Delete Modal Buttons
        DOM.btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
        DOM.btnCancelDelete.addEventListener('click', closeDeleteModal);
        DOM.btnConfirmDelete.addEventListener('click', confirmDelete);

        // Header Actions
        DOM.btnExportData.addEventListener('click', exportInventory);
        DOM.btnResetData.addEventListener('click', resetDemoData);

        // Event delegation for table & cards (steppers, edit, delete)
        document.addEventListener('click', (e) => {
            // Quantity Minus
            const minusBtn = e.target.closest('.btn-qty-minus');
            if (minusBtn) {
                const id = minusBtn.dataset.id;
                adjustStock(id, -1);
                return;
            }

            // Quantity Plus
            const plusBtn = e.target.closest('.btn-qty-plus');
            if (plusBtn) {
                const id = plusBtn.dataset.id;
                adjustStock(id, 1);
                return;
            }

            // Edit Button
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                const id = editBtn.dataset.id;
                openEditModal(id);
                return;
            }

            // Delete Button
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                openDeleteModal(id);
                return;
            }
        });

        // Close modals on click outside dialog
        [DOM.productModal, DOM.deleteModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                const rect = modal.getBoundingClientRect();
                const isInDialog = (
                    rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                    rect.left <= e.clientX && e.clientX <= rect.left + rect.width
                );
                if (!isInDialog) {
                    if (modal === DOM.productModal) closeProductModal();
                    if (modal === DOM.deleteModal) closeDeleteModal();
                }
            });
        });
    }

    // --- Run on Load ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
