// Function to fetch and display products
async function displayProducts() {
    try {
        const response = await axios.get('/products');
        const products = response.data;
        const productList = document.getElementById('productList');
        productList.innerHTML = '';

        products.forEach(product => {
            if (product.stock > 0) { // Only display products with stock > 0
                const productElement = document.createElement('div');
                productElement.className = 'p-4 bg-white shadow rounded';
                productElement.innerHTML = `
                    <h2 class="text-lg font-bold">${product.productName}</h2>
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p>
                    <p>Stock: ${product.stock}</p>
                    <label for="quantity-${product._id}" class="block mt-2">Quantity:</label>
                    <input type="number" id="quantity-${product._id}" name="quantity" class="w-16 rounded border-gray-300">
                    <button onclick="addToCart('${product._id}', ${product.stock})" class="mt-2 bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600">Add to Cart</button>
                `;
                productList.appendChild(productElement);
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Function to add product to cart
async function addToCart(productId, availableStock) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityInput.value);

    if (quantity <= 0 || quantity > availableStock) {
        alert('Invalid quantity. Please enter a valid quantity.');
        return;
    }

    try {
        const response = await axios.put(`/add-to-cart/${productId}`, { quantity });
        const result = response.data;

        if (result.success) {
            alert(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart.`);
            // Update displayed stock after adding to cart
            displayProducts();
        } else {
            alert('Failed to add item to cart.');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart.');
    }
}

// Display products when the page loads
document.addEventListener('DOMContentLoaded', displayProducts);
