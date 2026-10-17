
 // Default products
const defaultProducts = [
    {
        name: "phone",
        price: 75000,
        ctegory: "electronic",
        innstoke: true,
        color: "Black"
    },
    {
        name: "LED",
        price: 125000,
        ctegory: "electronic",
        innstoke: true,
        color: "White"
    },
    {
        name: "Dryer",
        price: 3500,
        ctegory: "electronic",
        innstoke: false,
        color: "Grey"
    },
    {
        name: "pen",
        price: 150,
        ctegory: "stationary",
        innstoke: true,
        color: "Blue"
    },
    {
        name: "RAM",
        price: 25000,
        ctegory: "accessori",
        innstoke: true,
        color: "Red"
    }
];

// Load products from browser storage
const savedProducts = localStorage.getItem("products");

let product = savedProducts
    ? JSON.parse(savedProducts)
    : defaultProducts;

// Save products in browser storage
function saveProducts() {
    localStorage.setItem("products", JSON.stringify(product));
}

// HTML elements
const productTable = document.getElementById("productTable");
const pageTitle = document.getElementById("pageTitle");
const categoryList = document.getElementById("categoryList");
const addItemForm = document.getElementById("addItemForm");

// Selected filters
let selectedCategory = "all";
let selectedStock = "all";
let sortOrder = "none";

// Calculate total price of in-stock products
function displayTotalAmount() {
    let total = 0;

    product.forEach(function(item) {
        if (item.innstoke === true) {
            total = total + Number(item.price);
        }
    });

    document.getElementById("totalAmount").textContent =
        "Rs. " + total.toLocaleString();
}

// Display products in the table
function displayProducts(products) {
    productTable.innerHTML = "";

    if (products.length === 0) {
        productTable.innerHTML =
            '<tr><td colspan="7">No products found.</td></tr>';

        displayTotalAmount();
        return;
    }

    products.forEach(function(item) {
        const originalIndex = product.indexOf(item);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <button class="delete-btn"
                    onclick="deleteProduct(${originalIndex})">
                    Delete
                </button>
            </td>
            <td>${originalIndex + 1}</td>
            <td>${escapeHTML(item.name)}</td>
            <td>Rs. ${Number(item.price).toLocaleString()}</td>
            <td>${escapeHTML(item.ctegory)}</td>
            <td class="${item.innstoke ? "in-stock" : "out-stock"}">
                ${item.innstoke ? "✓ In Stock" : "✗ Out of Stock"}
            </td>
            <td>${escapeHTML(item.color)}</td>
        `;

        productTable.appendChild(row);
    });

    displayTotalAmount();
}

// Delete a product
function deleteProduct(index) {
    const answer = confirm(
        "Are you sure you want to delete this product?"
    );

    if (answer === true) {
        product.splice(index, 1);

        // Save the updated list
        saveProducts();

        // Refresh categories and product table
        loadCategories();
        updateActiveButtons();
        filterProducts();
    }
}

// Prevent HTML injection
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}

// Add a category to the sidebar
function addCategory(category) {
    const cleanCategory = String(category).trim();

    if (!cleanCategory) {
        return;
    }

    const existingCategories =
        categoryList.querySelectorAll("[data-category]");

    for (const button of existingCategories) {
        if (
            button.dataset.category.toLowerCase() ===
            cleanCategory.toLowerCase()
        ) {
            return;
        }
    }

    const button = document.createElement("button");

    button.type = "button";
    button.className = "nav-link";
    button.dataset.category = cleanCategory;

    button.textContent =
        cleanCategory.charAt(0).toUpperCase() +
        cleanCategory.slice(1);

    categoryList.appendChild(button);
}

// Load categories
function loadCategories() {
    categoryList.innerHTML = "";

    product.forEach(function(item) {
        addCategory(item.ctegory);
    });
}

// Filter and sort products
function filterProducts() {
    let filteredProducts = product.filter(function(item) {
        const categoryMatches =
            selectedCategory === "all" ||
            item.ctegory.toLowerCase() ===
            selectedCategory.toLowerCase();

        const stockMatches =
            selectedStock === "all" ||
            String(item.innstoke) === selectedStock;

        return categoryMatches && stockMatches;
    });

    if (sortOrder === "ascending") {
        filteredProducts.sort(function(a, b) {
            return Number(a.price) - Number(b.price);
        });
    }

    if (sortOrder === "descending") {
        filteredProducts.sort(function(a, b) {
            return Number(b.price) - Number(a.price);
        });
    }

    if (selectedCategory !== "all") {
        pageTitle.textContent =
            selectedCategory.charAt(0).toUpperCase() +
            selectedCategory.slice(1);
    } else if (selectedStock === "true") {
        pageTitle.textContent = "In Stock Products";
    } else if (selectedStock === "false") {
        pageTitle.textContent = "Out of Stock Products";
    } else {
        pageTitle.textContent = "All Products";
    }

    displayProducts(filteredProducts);
}

// Update active filter buttons
function updateActiveButtons() {
    document.querySelectorAll("[data-category]").forEach(function(button) {
        button.classList.toggle(
            "active",
            button.dataset.category.toLowerCase() ===
            selectedCategory.toLowerCase()
        );
    });

    document.querySelectorAll("[data-stock]").forEach(function(button) {
        button.classList.toggle(
            "active",
            button.dataset.stock === selectedStock
        );
    });
}

// All Products button
document.querySelector('[data-category="all"]')
    .addEventListener("click", function() {
        selectedCategory = "all";
        selectedStock = "all";

        updateActiveButtons();
        filterProducts();
    });

// Category buttons
categoryList.addEventListener("click", function(event) {
    const button = event.target.closest("[data-category]");

    if (!button) {
        return;
    }

    selectedCategory = button.dataset.category;
    selectedStock = "all";

    updateActiveButtons();
    filterProducts();
});

// Stock filters
document.querySelectorAll("[data-stock]").forEach(function(button) {
    button.addEventListener("click", function() {
        selectedStock = button.dataset.stock;
        selectedCategory = "all";

        updateActiveButtons();
        filterProducts();
    });
});

// Low to high
document.getElementById("ascending")
    .addEventListener("click", function() {
        sortOrder = "ascending";
        filterProducts();
    });

// High to low
document.getElementById("descending")
    .addEventListener("click", function() {
        sortOrder = "descending";
        filterProducts();
    });

// Clear sorting
document.getElementById("clearSort")
    .addEventListener("click", function() {
        sortOrder = "none";
        filterProducts();
    });

// Show Add Product form
document.getElementById("addItemBtn")
    .addEventListener("click", function() {
        addItemForm.classList.toggle("hidden");
    });

// Cancel Add Product form
document.getElementById("cancelItemBtn")
    .addEventListener("click", function() {
        addItemForm.classList.add("hidden");
    });

// Add a new product
document.getElementById("saveItemBtn")
    .addEventListener("click", function() {
        const name =
            document.getElementById("itemName").value.trim();

        const priceText =
            document.getElementById("itemPrice").value;

        const category =
            document.getElementById("itemCategory").value.trim();

        const stock =
            document.getElementById("itemStock").value === "true";

        const color =
            document.getElementById("itemColor").value.trim();

        const price = Number(priceText);

        if (!name || priceText === "" || !category || !color) {
            alert("Please fill in all fields.");
            return;
        }

        if (!Number.isFinite(price) || price < 0) {
            alert("Please enter a valid price.");
            return;
        }

        const newProduct = {
            name: name,
            price: price,
            ctegory: category,
            innstoke: stock,
            color: color
        };

        product.push(newProduct);

        saveProducts();
        loadCategories();

        selectedCategory = "all";
        selectedStock = "all";
        sortOrder = "none";

        updateActiveButtons();
        filterProducts();

        document.getElementById("itemName").value = "";
        document.getElementById("itemPrice").value = "";
        document.getElementById("itemCategory").value = "";
        document.getElementById("itemStock").value = "true";
        document.getElementById("itemColor").value = "";

        addItemForm.classList.add("hidden");

        alert("Product added successfully!");
    });

// Start the dashboard
loadCategories();
updateActiveButtons();
filterProducts();
