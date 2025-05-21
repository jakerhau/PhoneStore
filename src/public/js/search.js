// lấy tên sản phẩm từ input từ customer trả về trang products
const searchInput = document.querySelector('input[name="search"]');
const searchForm = document.querySelector('form');

// Prevent form submission on enter
searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const searchValue = searchInput.value.trim();
    
    if (searchValue !== '') {
        window.location.href = `/products?search=${encodeURIComponent(searchValue)}`;
    }
});

// Handle search button click
const searchButton = document.querySelector('.fa-search').parentElement;
searchButton.addEventListener('click', function() {
    const searchValue = searchInput.value.trim();
    
    if (searchValue !== '') {
        window.location.href = `/products?search=${encodeURIComponent(searchValue)}`;
    }
});



