const success = document.getElementById('success');
const error = document.getElementById('error');
if (success) {
    setTimeout(() => {
        success.style.opacity = 0;
        setTimeout(() => {
            success.style.display = 'none';
        }, 300);
    }, 3000);
}
if (error) {
    setTimeout(() => {
        error.style.opacity = 0;
        setTimeout(() => {
            error.style.display = 'none';
        }, 300);
    }, 3000);
}