import '../resources/css/app.css';

const el = document.getElementById('buildTime');
if (el) {
    el.textContent = new Date().toISOString();
}
