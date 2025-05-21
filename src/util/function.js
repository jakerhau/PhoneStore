function currencyFormat(number, suffix = 'đ') {
    // Định dạng số với dấu phẩy làm phân cách phần ngàn
    const formattedNumber = number.toLocaleString('vi-VN', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).replace(/\./g, ','); // Thay dấu chấm bằng dấu phẩy

    // Trả về số đã định dạng cộng với suffix mà không có khoảng cách
    return `${formattedNumber}${suffix}`;
}

const generateBarcode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let barcode = '';
    for (let i = 0; i < 10; i++) {
      barcode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return barcode;
};

module.exports = { currencyFormat, generateBarcode };
  