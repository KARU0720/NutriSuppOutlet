async function addProductData() {
    const productName = document.getElementById('productName').value;
    const description = document.getElementById('description').value;
    const price = parseFloat(document.getElementById('price').value);
    const stock = parseInt(document.getElementById('stock').value);

    const data = {
        productName,
        description,
        price,
        stock
    };

    try {
        const response = await fetch('/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        document.getElementById('productName').value = '';
        document.getElementById('description').value = '';
        document.getElementById('price').value = '';
        document.getElementById('stock').value = '';

        displayProducts();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function displayProducts() {
    try {
        const response = await fetch('/products');
        const products = await response.json();
        const productList = document.getElementById('productList');
        productList.innerHTML = '';

        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'p-4 bg-white shadow rounded';
            productElement.innerHTML = `
                <h2 class="text-lg font-bold">${product.productName}</h2>
                <p>${product.description}</p>
                <p>Price: $${product.price}</p>
                <p>Stock: ${product.stock}</p>
                <button onclick="showEditForm('${product._id}')" class="mt-2 bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600">Edit</button>
                <div id="editForm-${product._id}" class="hidden mt-4">
                    <input type="text" id="editName-${product._id}" value="${product.productName}" class="block w-full mt-2 rounded border-gray-300">
                    <input type="text" id="editDescription-${product._id}" value="${product.description}" class="block w-full mt-2 rounded border-gray-300">
                    <input type="number" id="editPrice-${product._id}" value="${product.price}" class="block w-full mt-2 rounded border-gray-300">
                    <input type="number" id="editStock-${product._id}" value="${product.stock}" class="block w-full mt-2 rounded border-gray-300">
                    <button onclick="editProductData('${product._id}')" class="mt-2 bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600">Save</button>
                </div>
            `;
            productList.appendChild(productElement);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function showEditForm(productId) {
    const editForm = document.getElementById(`editForm-${productId}`);
    editForm.classList.toggle('hidden');
}

async function editProductData(productId) {
    const productName = document.getElementById(`editName-${productId}`).value;
    const description = document.getElementById(`editDescription-${productId}`).value;
    const price = parseFloat(document.getElementById(`editPrice-${productId}`).value);
    const stock = parseInt(document.getElementById(`editStock-${productId}`).value);

    const data = {
        productName,
        description,
        price,
        stock
    };

    try {
        const response = await fetch(`/edit-product/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        displayProducts();
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', displayProducts);
