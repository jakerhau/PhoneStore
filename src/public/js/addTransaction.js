let selectedProductsGlobal = [];
let productsGlobal = [];
let productsShow = [];

const PATTERN_VALIDATE_PHONE = /^[0-9]{10}$/;

const inputSearchProduct = document.getElementById("search-products");
const searchProductList = document.getElementById("search-products-show");
const selectedProducts = document.getElementById("selected-products");
const selectedProductsSummary = document.getElementById("selected-products-summary");
const totalAmountSummary = document.getElementById("total-amount-summary");
const totalAmountSummaryAfterDiscount = document.getElementById("total-amount-summary-after-discount");
const totalAmountCustomerSummary = document.getElementById("total-amount-customer");
const changeAmountCustomerSummary = document.getElementById("change-amount-customer");
const inputCustomerName = document.getElementById("customerName");
const inputCustomerPhone = document.getElementById("customerPhone");
const inputCustomerAddress = document.getElementById("customerAddress");
const inputTotalAmount = document.getElementById("totalAmount");
const btnCheckInfoCustomer = document.getElementById("btn-check-info-customer");
const customerNameLabel = document.getElementById("customerNameLabel");
const customerPhoneLabel = document.getElementById("customerPhoneLabel");
const customerAddressLabel = document.getElementById("customerAddressLabel");
const formFieldCustomerName = document.getElementById("form-field-customer-name");
const formFieldCustomerAddress = document.getElementById("form-field-customer-address");
const btnSubmit = document.getElementById("submit-transaction-btn");
let isProductClicked = false;

const promotionSelect = document.getElementById("promotionId");
let currentPromotion = null;
let promotions = []; // Thêm biến lưu danh sách mã giảm giá

btnCheckInfoCustomer.addEventListener("click", getInfoCustomer);
btnCheckInfoCustomer.classList.add("hidden");

inputTotalAmount.addEventListener("keyup", (event) => {
  const paidAmount = parseFloat(event.target.value) || 0;
  const totalProductsPrice = sumSelectedProducts();
  const discountedPrice = calculateDiscountedPrice(totalProductsPrice);

  totalAmountCustomerSummary.textContent = formatCurrency(paidAmount);
  changeAmountCustomerSummary.textContent = formatCurrency(paidAmount - discountedPrice);
  isCanSubmitForm();
});
inputCustomerPhone.addEventListener("keyup", handleChangeCustomerPhone);

inputSearchProduct.addEventListener("keyup", handleChangeSearchProducts);
inputSearchProduct.addEventListener("blur", () => {
  if (!isProductClicked) {
    searchProductList.classList.remove("!opacity-100");
    searchProductList.classList.remove("!visible");
    searchProductList.innerHTML = "";
  }
});
searchProductList.addEventListener("mousedown", function () {
  isProductClicked = true;
});

inputSearchProduct.addEventListener("focus", () => {
  isProductClicked = false;
  if (inputSearchProduct.value.length > 0) {
    // searchProductList.classList.remove("opacity-0");
    // searchProductList.classList.remove("invisible");
    // searchProductList.classList.add("opacity-100");
    // searchProductList.classList.add("visible");
    searchProductList.classList.add("!opacity-100");
    searchProductList.classList.add("!visible");
    productsShow = productsGlobal.filter((product) => {
      if (inputSearchProduct.value.length === 10) {
        return (
          product.name
            .toLowerCase()
            .includes(inputSearchProduct.value.toLowerCase()) ||
          product.barcode === inputSearchProduct.value
        );
      }
      return product.name
        .toLowerCase()
        .includes(inputSearchProduct.value.toLowerCase());
    });

    productsShow = productsShow.slice(0, 20);
    if (!inputSearchProduct.value) {
      searchProductList.innerHTML = ""; // Clear previous results
      productsShow = shuffle(productsShow).slice(0, 5);
    }
    // div to show: searchProductList
    searchProductList.innerHTML = ""; // Clear previous results
    if (productsShow.length) {
      renderSearchProducts();
      return;
    }
  }
  productsShow = shuffle(productsGlobal).slice(0, 5);
  // div to show: searchProductList
  searchProductList.classList.add("opacity-100");
  searchProductList.classList.add("visible");
  searchProductList.classList.remove("opacity-0");
  searchProductList.classList.remove("invisible");
  // searchProductList.classList.add("opacity-100");
  // searchProductList.classList.add("visible");
  searchProductList.innerHTML = ""; // Clear previous results
  if (productsShow.length) {
    renderSearchProducts();
  } else {
    searchProductList.innerHTML = ""; // Clear previous results
    searchProductList.innerHTML = "<p>No products found.</p>"; // Message when no products found
  }
});

inputCustomerName.addEventListener("keyup", (event) => {
  customerNameLabel.textContent = event.target.value;
  isCanSubmitForm();
});
inputCustomerPhone.addEventListener("keyup", (event) => {
  customerPhoneLabel.textContent = event.target.value;
  isCanSubmitForm();
});
inputCustomerAddress.addEventListener("keyup", (event) => {
  customerAddressLabel.textContent = event.target.value;
  isCanSubmitForm();
});

function getAllProducts(products) {
  productsGlobal = [...products];
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(amount)
    .replaceAll(".", ",");
}

function handleSelectProduct(barcode) {
  isProductClicked = false;
  searchProductList.classList.remove("!opacity-100");
  searchProductList.classList.remove("!visible");
  searchProductList.innerHTML = "";

  barcode = "" + barcode;
  if (barcode.length > 0 && barcode.length < 10) {
    barcode = "0" + barcode;
  }

  const existSelectedProductIndex = selectedProductsGlobal.findIndex((product) => product.barcode === barcode);

  if (existSelectedProductIndex !== -1) {
    // Nếu sản phẩm đã có, xóa nó khỏi danh sách
    selectedProductsGlobal = selectedProductsGlobal.filter(product => product.barcode !== barcode);
  } else {
    // Nếu sản phẩm chưa có, thêm vào danh sách
    const selectedProduct = productsGlobal.find(product => product.barcode === barcode);
    if (selectedProduct) {
      // Kiểm tra số lượng tồn kho
      if (selectedProduct.quantity <= 0) {
        toastr.error('Sản phẩm đã hết hàng');
        return;
      }
      selectedProductsGlobal.push({ ...selectedProduct, quantity: 1 });
    }
  }

  // Cập nhật giao diện
  renderSelectedProducts();
  isCanSubmitForm();
}

function increaseProductQuantity(barcode) {
  barcode = "" + barcode;
  if (barcode.length > 0 && barcode.length < 8) {
    barcode = "0" + barcode;
  }
  const selectedProductIndex = selectedProductsGlobal.findIndex(
    (product) => product.barcode === barcode
  );

  const product = productsGlobal.find(p => p.barcode === barcode);
  if (!product) return;

  // Kiểm tra số lượng tồn kho
  if (selectedProductsGlobal[selectedProductIndex].quantity >= product.quantity) {
    toastr.error('Số lượng vượt quá tồn kho');
    return;
  }

  const updatedProduct = {
    ...selectedProductsGlobal[selectedProductIndex],
    quantity: selectedProductsGlobal[selectedProductIndex].quantity + 1,
  };
  selectedProductsGlobal[selectedProductIndex] = updatedProduct;
  renderSelectedProducts();
  isCanSubmitForm();
}

function decreaseProductQuantity(barcode) {
  barcode = "" + barcode;
  if (barcode.length > 0 && barcode.length < 8) {
    barcode = "0" + barcode;
  }
  const selectedProductIndex = selectedProductsGlobal.findIndex(
    (product) => product.barcode === barcode
  );
  if (selectedProductsGlobal[selectedProductIndex].quantity === 1) {
    selectedProductsGlobal = selectedProductsGlobal.filter(
      (product) => product.barcode !== barcode
    );
    if (checkIsEmptySelectedProducts()) {
      return;
    }
    renderSelectedProducts();
    return;
  }
  const updatedProduct = {
    ...selectedProductsGlobal[selectedProductIndex],
    quantity: selectedProductsGlobal[selectedProductIndex].quantity - 1,
  };
  selectedProductsGlobal[selectedProductIndex] = updatedProduct;
  renderSelectedProducts();
  isCanSubmitForm();
}

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function handleChangeCustomerPhone(event) {
  formFieldCustomerName.classList.remove("!opacity-100");
  formFieldCustomerName.classList.remove("!visible");
  formFieldCustomerAddress.classList.remove("!opacity-100");
  formFieldCustomerAddress.classList.remove("!visible");
  customerNameLabel.textContent = "";
  customerAddressLabel.textContent = "";
  if (
    event.target.value.trim().length === 0 ||
    !event.target.value.trim().match(PATTERN_VALIDATE_PHONE)
  ) {
    btnCheckInfoCustomer.classList.add("hidden");
    return;
  }
  btnCheckInfoCustomer.classList.remove("hidden");
}

function handleChangeSearchProducts(event) {
  isProductClicked = false;
  const searchValue = event.target.value.toLowerCase();
  productsShow = productsGlobal.filter((product) => {
    // if (event.target.value.length === 10) {
    return (
      product.name.toLowerCase().includes(searchValue) ||
      product.barcode.toLowerCase().includes(searchValue)
      // product.barcode === event.target.value
    );
    // }
    return product.name
      .toLowerCase()
      .includes(event.target.value.toLowerCase());
  });

  productsShow = productsShow.slice(0, 20);
  if (!event.target.value) {
    searchProductList.innerHTML = ""; // Clear previous results
    productsShow = shuffle(productsShow).slice(0, 5);
  }
  // div to show: searchProductList
  if (productsShow.length) {
    renderSearchProducts();
  } else {
    searchProductList.innerHTML = "";
    searchProductList.innerHTML = "<p>No products found.</p>"; // Message when no products found
  }
}

function checkIsEmptySelectedProducts() {
  if (selectedProductsGlobal.length === 0) {
    handleEmptySelectedProducts();
    return true;
  }
  return false;
}

function renderSelectedProducts() {
  selectedProducts.innerHTML = "";
  selectedProductsSummary.innerHTML = "";
  const totalProductsPrice = sumSelectedProducts();
  const discountedPrice = calculateDiscountedPrice(totalProductsPrice);

  // Hiển thị giá gốc
  totalAmountSummary.textContent = formatCurrency(totalProductsPrice);

  // Hiển thị giá sau khi áp dụng mã giảm giá
  if (currentPromotion) {
    totalAmountSummaryAfterDiscount.textContent = formatCurrency(discountedPrice);
    totalAmountSummaryAfterDiscount.classList.remove('hidden');
  } else {
    totalAmountSummaryAfterDiscount.textContent = formatCurrency(totalProductsPrice);
    totalAmountSummaryAfterDiscount.classList.add('hidden');
  }

  // Cập nhật số tiền thối (số tiền khách trả - giá sau mã giảm giá)
  const paidAmount = parseFloat(inputTotalAmount.value) || 0;
  const changeAmount = paidAmount - discountedPrice;
  changeAmountCustomerSummary.textContent = formatCurrency(changeAmount);

  const cloneSelectedProductsGlobal = [...selectedProductsGlobal];
  const reversed = cloneSelectedProductsGlobal.reverse();

  reversed.forEach((product) => {
    selectedProducts.innerHTML += `
        <div class="grid grid-cols-[2fr_1fr_1fr_1fr] items-center p-2 border rounded ">
          <div class="flex items-center gap-1.5">
            <img class="w-20"
              src="${product.photo}"
              alt="${product.name}" loading="lazy">
            <span class="text-md font-semibold">${product.name}</span>
          </div>
          <span class="font-semibold">${formatCurrency(
      product["retail_price"]
    )}</span>
          <div class="flex items-center gap-2 justify-self-center">
            <button type="button" onclick="decreaseProductQuantity('${product.barcode
      }')" class="items-center p-2 bg-[#EDEDED] cursor-pointer select-none">
              <svg class="w-5 h-5" width='24' height='24' viewBox='0 0 24 24' fill='none'
              xmlns='http://www.w3.org/2000/svg'>
              <rect width='24' height='24' />
              <path d='M5 12H19' stroke='black' stroke-width='2.66667' stroke-linecap='round' stroke-linejoin='round' />
              </svg>
            </button>
            <span class="flex items-center justify-center size-8">${product.quantity
      }</span>
            <button type="button" onclick="increaseProductQuantity('${product.barcode
      }')" class="items-center p-2 bg-[#EDEDED] cursor-pointer select-none">
              <svg class="w-5 h-5" width='24' height='24' viewBox='0 0 24 24' fill='none'
              xmlns='http://www.w3.org/2000/svg'>
              <rect width='24' height='24' />
              <path d='M18 12.998H13V17.998C13 18.2633 12.8946 18.5176 12.7071 18.7052C12.5196 18.8927 12.2652 18.998 12 18.998C11.7348 18.998 11.4804 18.8927 11.2929 18.7052C11.1054 18.5176 11 18.2633 11 17.998V12.998H6C5.73478 12.998 5.48043 12.8927 5.29289 12.7052C5.10536 12.5176 5 12.2633 5 11.998C5 11.7328 5.10536 11.4785 5.29289 11.2909C5.48043 11.1034 5.73478 10.998 6 10.998H11V5.99805C11 5.73283 11.1054 5.47848 11.2929 5.29094C11.4804 5.1034 11.7348 4.99805 12 4.99805C12.2652 4.99805 12.5196 5.1034 12.7071 5.29094C12.8946 5.47848 13 5.73283 13 5.99805V10.998H18C18.2652 10.998 18.5196 11.1034 18.7071 11.2909C18.8946 11.4785 19 11.7328 19 11.998C19 12.2633 18.8946 12.5176 18.7071 12.7052C18.5196 12.8927 18.2652 12.998 18 12.998Z' fill='currentColor'
                      />
              </svg>
            </buttont>
          </div>
          <button type="button" onclick="handleSelectProduct('${product.barcode
      }')" class="button-red-ghost-sm h-8 px-4 w-max justify-self-center" >Xoá</button>
        </div>
      `;
    selectedProductsSummary.innerHTML += `
      <div class="grid grid-cols-[3fr_30px_2fr] items-center">
        <span class="text-md font-medium text-wrap">${product.name}</span>
        <span class="justify-self-center">${product.quantity}</span>
        <span class="font-medium justify-self-end">${formatCurrency(
      product.quantity * product.retail_price
    )}</span>
      </div>
      `;
  });
}

function renderSearchProducts() {
  searchProductList.innerHTML = "";
  productsShow.forEach((product) => {
    const isSelected =
      selectedProductsGlobal
        .map((i) => i.barcode)
        .findIndex((i) => i == product.barcode) != -1;
    searchProductList.innerHTML += `
    <div class="flex flex-col gap-1.5">
      <div class="grid grid-cols-[4fr_8fr] items-center p-2 border rounded ">
        <div class="flex items-center gap-1.5">
          <img class="w-10" src="${product.photo}" alt="${product.name}" loading="lazy">
          <div class="flex flex-col gap-1.5">
            <span class="text-base font-medium">${product.name}</span>
            <span class="font-semibold">${formatCurrency(product["retail_price"])}</span>
          </div>
        </div>
        <button type="button" class="button-${!isSelected ? "primary" : "red"}-ghost-sm h-8 px-4 w-max justify-self-end" onclick="handleSelectProduct('${product.barcode}')">${!isSelected ? "Chọn" : "Xoá"}</button>
      </div>
    </div>
    `;
  });
}

function handleEmptySelectedProducts() {
  selectedProducts.innerHTML = "";
  selectedProductsSummary.innerHTML = "";
  selectedProducts.innerHTML += `<div class="w-full h-20 flex items-center justify-center border">Hiện tại chưa có sản phẩm được chọn!</div>`;
  selectedProductsSummary.innerHTML += `<div class="w-full h-10 flex items-center justify-center border">Hiện tại chưa có sản phẩm được chọn!</div>`;
  totalAmountSummary.textContent = formatCurrency(0);
  totalAmountSummaryAfterDiscount.textContent = formatCurrency(0);
  totalAmountSummaryAfterDiscount.classList.add('hidden');
  totalAmountCustomerSummary.textContent = formatCurrency(0);
  changeAmountCustomerSummary.textContent = formatCurrency(0);
}

async function getInfoCustomer() {
  btnCheckInfoCustomer.classList.add("hidden");
  const phoneNumber = inputCustomerPhone.value;
  try {
    const res = await fetch('/admin/transactions/check-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerPhone: phoneNumber }),
    });
    const data = await res.json();
    if (data.status === 200) {
      inputCustomerName.value = data.customer.name;
      inputCustomerAddress.value = data.customer.address;
      customerNameLabel.textContent = data.customer.name;
      customerAddressLabel.textContent = data.customer.address;
      formFieldCustomerName.classList.add("!opacity-100");
      formFieldCustomerName.classList.add("!visible");
      formFieldCustomerAddress.classList.add("!opacity-100");
      formFieldCustomerAddress.classList.add("!visible");
      inputCustomerName.setAttribute("disabled", true);
      inputCustomerName.setAttribute("readonly", true);
      inputCustomerAddress.setAttribute("disabled", true);
      inputCustomerAddress.setAttribute("readonly", true);
    } else {
      // btnCheckInfoCustomer.setAttribute("disabled", true);
      const toastRed = document.getElementById("toastRed");
      const toastRedTitle = document.getElementById("toastRed-title");
      const toastRedContent = document.getElementById("toastRed-content");
      toastRedTitle.textContent = "Khách hàng chưa từng mua hàng";
      toastRedContent.textContent = "Vui lòng điền thông tin khách hàng";
      toastRed.classList.add("md:right-5");
      toastRed.classList.add("right-4");
      setTimeout(() => {
        toastRed.classList.remove("md:right-5");
        toastRed.classList.remove("right-4");
        toastRedTitle.textContent = "";
        toastRedContent.textContent = "";
      }, 3000);
      inputCustomerName.value = "";
      inputCustomerAddress.value = "";
      customerNameLabel.textContent = "";
      customerAddressLabel.textContent = "";
      formFieldCustomerName.classList.add("!opacity-100");
      formFieldCustomerName.classList.add("!visible");
      formFieldCustomerAddress.classList.add("!opacity-100");
      formFieldCustomerAddress.classList.add("!visible");
      inputCustomerName.removeAttribute("disabled");
      inputCustomerName.removeAttribute("readonly");
      inputCustomerAddress.removeAttribute("disabled");
      inputCustomerAddress.removeAttribute("readonly");
    }
  } catch (error) { }
}

async function postJSON() {
  try {
    const productsListBuy = [
      ...selectedProductsGlobal.map((product) => ({
        product_barcode: product.barcode,
        quantity: product.quantity,
        import_price: product.import_price,
        retail_price: product.retail_price,
      })),
    ];
    const paidAmount = parseFloat(inputTotalAmount.value) || 0;
    const totalProductsPrice = sumSelectedProducts();
    const discountedPrice = calculateDiscountedPrice(totalProductsPrice);
    const changeAmount = paidAmount - discountedPrice;

    // Kiểm tra lại điều kiện trước khi gửi
    if (currentPromotion) {
      const now = new Date();
      const startDate = new Date(currentPromotion.startDate);
      const endDate = new Date(currentPromotion.endDate);

      if (now < startDate || now > endDate) {
        toastr.error('Mã giảm giá đã hết hạn hoặc chưa bắt đầu');
        return;
      }
    }

    const response = await fetch("/admin/transactions/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        customerPhone: inputCustomerPhone.value,
        customerName: inputCustomerName.value,
        customerAddress: inputCustomerAddress.value,
        details: productsListBuy,
        paidAmount: paidAmount,
        promotionId: currentPromotion ? currentPromotion._id : null,
        discountedPrice: discountedPrice,
        originalPrice: totalProductsPrice,
        changeAmount: changeAmount,
        promotionDetails: currentPromotion ? {
          name: currentPromotion.name,
          discountType: currentPromotion.discountType,
          discountValue: currentPromotion.discountValue
        } : null
      }),
    });

    // Kiểm tra status của response
    if (response.status === 201) {
      const data = await response.json();
      btnSubmit.setAttribute("disabled", true);
      const toast = document.getElementById("toast");
      const toastTitle = document.getElementById("toast-title");
      const toastContent = document.getElementById("toast-content");
      toastTitle.textContent = "Tạo đơn hàng thành công";
      toastContent.textContent = "Di chuyển đến trang chi tiết sau 3s.";

      // Hiển thị thông báo
      toast.classList.remove("-right-[999px]");
      toast.classList.add("md:right-5");
      toast.classList.add("right-4");

      setTimeout(() => {
        toast.classList.remove("md:right-5");
        toast.classList.remove("right-4");
        toast.classList.add("-right-[999px]");
        toastTitle.textContent = "";
        toastContent.textContent = "";
        window.location.replace(`${window.location.origin}/admin/transactions/show?id=${data.transaction._id}`);
      }, 3000);
    } else {
      const error = await response.json();
      toastr.error(error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    }
  } catch (error) {
    console.error("Error creating transaction:", error);
    toastr.error('Có lỗi xảy ra khi tạo đơn hàng');
  }
}

function sumSelectedProducts() {
  return selectedProductsGlobal.reduce(
    (sum, product) => sum + product.retail_price * product.quantity,
    0
  );
}

function isCanSubmitForm() {
  const totalProductsPrice = sumSelectedProducts();
  const discountedPrice = calculateDiscountedPrice(totalProductsPrice);
  const paidAmount = parseFloat(inputTotalAmount.value) || 0;

  const isCanSubmit =
    inputCustomerPhone.value.trim().length > 0 &&
    inputCustomerPhone.value.trim().match(PATTERN_VALIDATE_PHONE) &&
    inputCustomerName.value.trim().length > 0 &&
    inputCustomerAddress.value.trim().length > 0 &&
    selectedProductsGlobal.length > 0 &&
    paidAmount >= discountedPrice;

  btnSubmit.setAttribute("disabled", !isCanSubmit);
  if (!isCanSubmit) {
    btnSubmit.setAttribute("disabled", true);
    return;
  }

  btnSubmit.removeAttribute("disabled");
}

(function () {
  handleEmptySelectedProducts();
  !isCanSubmitForm();
})();

async function generatePDF() {
  try {
    const customerName = document.getElementById('customerNameLabel').innerText;
    const customerPhone = document.getElementById('customerPhoneLabel').innerText;
    const customerAddress = document.getElementById('customerAddressLabel').innerText;

    // Lấy danh sách sản phẩm
    const products = [];
    const productRows = document.querySelectorAll('#selected-products-summary div');
    productRows.forEach(row => {
      const spans = row.querySelectorAll('span');
      if (spans.length >= 3) {
        products.push({
          name: spans[0].innerText,
          quantity: spans[1].innerText,
          price: spans[2].innerText
        });
      }
    });

    const totalAmount = document.getElementById('total-amount-summary').innerText;
    const totalReceived = document.getElementById('total-amount-customer').innerText;
    const changeAmount = document.getElementById('change-amount-customer').innerText;
    const totalAmountAfterDiscount = document.getElementById('total-amount-summary-after-discount').innerText;

    // Tạo nội dung PDF
    const docDefinition = {
      content: [
        { text: 'ShopHub', style: 'shopName' },
        { text: 'HOÁ ĐƠN GIAO DỊCH', style: 'header' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
        { text: '\n' },

        { text: 'THÔNG TIN KHÁCH HÀNG', style: 'subheader' },
        {
          ul: [
            `Tên khách hàng: ${customerName}`,
            `Số điện thoại: ${customerPhone}`,
            `Địa chỉ: ${customerAddress}`,
            `Ngày mua: ${new Date().toLocaleDateString('vi-VN')}`,
          ]
        },
        { text: '\n' },

        { text: 'DANH SÁCH SẢN PHẨM', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto'],
            body: [
              [
                { text: 'Tên sản phẩm', bold: true },
                { text: 'Số lượng', bold: true, alignment: 'center' },
                { text: 'Thành tiền', bold: true, alignment: 'right' }
              ],
              ...products.map(p => [
                p.name,
                { text: p.quantity.toString(), alignment: 'center' },
                { text: p.price.toLocaleString('vi-VN'), alignment: 'right' }
              ])
            ]
          },
          layout: 'lightHorizontalLines'
        },
        { text: '\n' },

        { text: 'TỔNG KẾT', style: 'subheader' },
        {
          ul: [
            `Tổng đơn hàng: ${totalAmount.toLocaleString('vi-VN')}`,
            `Tổng tiền nhận: ${totalReceived.toLocaleString('vi-VN')}`,
            `Tổng tiền sau khi áp dụng mã giảm giá: ${totalAmountAfterDiscount.toLocaleString('vi-VN')}`,
            `Số tiền phải trả lại: ${changeAmount.toLocaleString('vi-VN')}`
          ]
        },

        { text: '\n' },
        { text: 'Lưu ý bảo hành', style: 'subheader' },
        { text: 'Bảo hành: 1 năm kể từ ngày mua' }
      ],
      styles: {
        shopName: {
          fontSize: 22,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 5],
          color: '#3366CC'
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    // Kiểm tra xem pdfMake đã được load chưa
    if (typeof pdfMake === 'undefined') {
      throw new Error('PDF library (pdfMake) is not loaded');
    }

    // Tạo và tải PDF
    pdfMake.createPdf(docDefinition).download('hoa_don_giao_dich.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toastr.error('Không thể tạo PDF. Vui lòng thử lại sau.');
  }
}

// Thêm hàm xử lý khi chọn mã giảm giá
promotionSelect.addEventListener('change', function () {
  const promotionId = this.value;
  if (!promotionId) {
    currentPromotion = null;
    updateTotalAmount();
    return;
  }

  // Lấy thông tin mã giảm giá từ danh sách promotions
  const promotion = promotions.find(p => p._id === promotionId);
  if (promotion) {
    currentPromotion = promotion;
    updateTotalAmount();
  }
});

// Hàm tính toán giá sau khi áp dụng mã giảm giá
function calculateDiscountedPrice(totalPrice) {
  if (!currentPromotion) return totalPrice;

  // Kiểm tra ngày hiện tại có nằm trong khoảng thời gian mã giảm giá không
  const now = new Date();
  const startDate = new Date(currentPromotion.startDate);
  const endDate = new Date(currentPromotion.endDate);

  if (now < startDate || now > endDate) {
    toastr.error('Mã giảm giá đã hết hạn hoặc chưa bắt đầu');
    currentPromotion = null;
    promotionSelect.value = '';
    return totalPrice;
  }

  let discountedPrice = totalPrice;
  if (currentPromotion.discountType === 'percentage') {
    discountedPrice = totalPrice * (1 - currentPromotion.discountValue / 100);
  } else {
    discountedPrice = totalPrice - currentPromotion.discountValue;
  }

  return Math.max(0, discountedPrice); // Đảm bảo giá không âm
}

// Cập nhật hàm updateTotalAmount
function updateTotalAmount() {
  const totalProductsPrice = sumSelectedProducts();
  const discountedPrice = calculateDiscountedPrice(totalProductsPrice);

  // Hiển thị giá gốc
  totalAmountSummary.textContent = formatCurrency(totalProductsPrice);

  // Hiển thị giá sau khi áp dụng mã giảm giá
  if (currentPromotion) {
    totalAmountSummaryAfterDiscount.textContent = formatCurrency(discountedPrice);
    totalAmountSummaryAfterDiscount.classList.remove('hidden');
  } else {
    totalAmountSummaryAfterDiscount.textContent = formatCurrency(totalProductsPrice);
    totalAmountSummaryAfterDiscount.classList.add('hidden');
  }

  // Cập nhật số tiền thối (số tiền khách trả - giá sau mã giảm giá)
  const paidAmount = parseFloat(inputTotalAmount.value) || 0;
  const changeAmount = paidAmount - discountedPrice;
  changeAmountCustomerSummary.textContent = formatCurrency(changeAmount);
}

// Hàm để lấy danh sách mã giảm giá từ server
async function fetchPromotions() {
  try {
    const response = await fetch('/admin/transactions/promotions');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.promotions) {
      throw new Error('Invalid response format');
    }
    promotions = data.promotions.map(promotion => ({
      ...promotion,
      startDate: new Date(promotion.startDate),
      endDate: new Date(promotion.endDate)
    }));

    // Cập nhật select box với danh sách mã giảm giá
    updatePromotionSelect();
  } catch (error) {
    console.error('Error fetching promotions:', error);
    toastr.error('Không thể tải danh sách mã giảm giá');
  }
}

// Hàm cập nhật select box mã giảm giá
function updatePromotionSelect() {
  if (!promotionSelect) return;

  // Xóa các option cũ
  promotionSelect.innerHTML = '<option value="">Chọn mã giảm giá</option>';

  // Thêm các option mới
  promotions.forEach(promotion => {
    const option = document.createElement('option');
    option.value = promotion._id;
    option.textContent = `${promotion.name} (${promotion.discountType === 'percentage' ? promotion.discountValue + '%' : formatCurrency(promotion.discountValue)})`;
    promotionSelect.appendChild(option);
  });
}

// Gọi hàm lấy danh sách mã giảm giá khi trang load
fetchPromotions();
