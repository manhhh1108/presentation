# CI/CD Demo: GitHub Actions → EC2

Hướng dẫn demo quy trình CI/CD tự động từ GitHub Actions đến EC2 trong buổi present.

## 🎯 Tổng quan

**CI (Continuous Integration)**
- Workflow: `.github/workflows/ci.yml`
- Trigger: mỗi khi push/PR
- Chức năng:
  - Chạy unit tests (PHPUnit + SQLite)
  - Build Laravel assets (Vite)
  - Build static pages
  - Đóng gói artifact (deploy.tgz)

**CD (Continuous Deployment)**
- Workflow: `.github/workflows/cd-ec2.yml`
- Trigger: khi CI workflow hoàn thành (branch `main`)
- Chức năng:
  - Download artifact từ CI
  - Upload lên EC2 qua SSH
  - Extract + cài composer
  - Chạy migrations
  - Cache Laravel config/routes/views

---

## 📋 Chuẩn bị Demo

### 1. EC2 Setup

**Yêu cầu trên EC2:**
```bash
# PHP 8.2+, Composer, Web server (Nginx/Apache)
php -v
composer -V

# Tạo thư mục app
sudo mkdir -p /var/www/presentation
sudo chown -R ubuntu:ubuntu /var/www/presentation

# Tạo .env file (không commit!)
cd /var/www/presentation
cp .env.example .env
php artisan key:generate

# Cấu hình DB, APP_URL, etc trong .env
nano .env

# Set permissions
sudo chgrp -R www-data storage bootstrap/cache
sudo chmod -R ug+rwX storage bootstrap/cache
```

**Nginx config ví dụ:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/presentation/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 2. SSH Key Setup

```bash
# Tạo SSH keypair (trên local hoặc EC2)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy

# Copy public key lên EC2
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Lưu private key (github_deploy) để set vào GitHub Secrets
```

### 3. GitHub Secrets

Vào **Repo Settings → Secrets and variables → Actions → New repository secret**

Cần tạo 4 secrets:

| Secret | Giá trị | Ví dụ |
|--------|---------|-------|
| `EC2_HOST` | Public IP/DNS của EC2 | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private key content | `-----BEGIN OPENSSH...` |
| `EC2_APP_PATH` | Đường dẫn app trên server | `/var/www/presentation` |

Optional:
- `EC2_PORT`: SSH port (mặc định `22`)

---

## 🎬 Kịch bản Demo

### Bước 1: Giới thiệu Codebase
- Mở project Laravel trong VS Code
- Show test files: `tests/Feature/ExampleTest.php`, `tests/Unit/ExampleTest.php`
- Show config: `phpunit.xml`, `package.json`
- Show workflows: `.github/workflows/ci.yml` và `cd-ec2.yml`

### Bước 2: Thay đổi code
```bash
# Ví dụ: sửa route welcome
# resources/views/welcome.blade.php
# hoặc thêm 1 test mới
```

### Bước 3: Commit & Push
```bash
git add .
git commit -m "feat: update welcome page"
git push origin main
```

### Bước 4: Theo dõi CI/CD
1. Mở GitHub → Tab **Actions**
2. Workflow **CI - Build & Test** sẽ chạy:
   - ✓ Checkout code
   - ✓ Install PHP dependencies
   - ✓ Run tests
   - ✓ Build assets
   - ✓ Upload artifact

3. Khi CI xong, workflow **CD - Deploy to EC2** tự động chạy:
   - ✓ Download artifact
   - ✓ SSH vào EC2
   - ✓ Extract package
   - ✓ composer install
   - ✓ php artisan migrate
   - ✓ Cache config/routes

### Bước 5: Kiểm tra kết quả
```bash
# SSH vào EC2
ssh ubuntu@<EC2_HOST>

# Check app version
cd /var/www/presentation
git log # (nếu deploy bằng git)
cat composer.json # hoặc check file nào đó

# Test website
curl http://<EC2_HOST>
# hoặc mở browser
```

---

## 🔍 Các điểm nhấn khi Present

### CI Pipeline
- **Tách biệt môi trường test:** SQLite in-memory, không cần DB server
- **Cache dependencies:** Composer cache, npm cache → build nhanh hơn
- **Parallel jobs:** có thể mở rộng (lint, security scan, etc)
- **Artifact:** đóng gói sẵn, CD chỉ cần download và deploy

### CD Pipeline
- **Workflow chaining:** `workflow_run` trigger tự động sau CI
- **SSH deploy:** secure, không cần credentials trong code
- **Zero-downtime:** có thể mở rộng với blue-green, symlink strategy
- **Rollback:** giữ artifact 7 ngày, có thể re-run workflow cũ

### Best Practices
- ✅ Secrets management (không hardcode credentials)
- ✅ Environment-specific config (.env không commit)
- ✅ Database migrations tự động
- ✅ Asset compilation tách khỏi runtime
- ✅ Cache optimization (config, routes, views)

---

## 🛠 Troubleshooting

### CI fails: "Tests failed"
→ Fix test code, push lại

### CD fails: "Permission denied"
```bash
# Check SSH key
cat ~/.ssh/github_deploy.pub
# Đảm bảo key này có trong ~/.ssh/authorized_keys trên EC2
```

### CD fails: "composer not found"
```bash
# Install composer trên EC2
cd /tmp
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### App không chạy sau deploy
```bash
# Check logs
tail -f /var/www/presentation/storage/logs/laravel.log

# Check permissions
sudo chown -R www-data:www-data /var/www/presentation/storage
sudo chown -R www-data:www-data /var/www/presentation/bootstrap/cache
```

---

## 🚀 Mở rộng

**Thêm các bước khác:**
- Slack/Discord notification khi deploy xong
- Run database seeder cho staging
- Health check endpoint
- Automated rollback nếu health check fail
- Multi-stage deploy (staging → production)
- Docker container deploy (thay vì raw PHP)

**Security:**
- Scan vulnerabilities (Snyk, Trivy)
- SAST (Static Analysis)
- Secrets rotation
- VPN/Bastion host cho production

---

## 📊 Metrics để Show

- **Build time:** thường < 3 phút
- **Deploy time:** thường < 1 phút
- **Test coverage:** hiển thị code coverage report
- **Success rate:** 95%+ (nếu có history)

---

## Checklist Demo

- [ ] EC2 đã setup (PHP, Composer, Nginx, .env)
- [ ] GitHub Secrets đã tạo đủ 4 giá trị
- [ ] SSH key hoạt động (test local: `ssh ubuntu@<EC2_HOST>`)
- [ ] Đã test CI/CD ít nhất 1 lần trước buổi present
- [ ] Chuẩn bị sẵn thay đổi code nhỏ để demo (ví dụ: sửa text trong view)
- [ ] Mở sẵn tab GitHub Actions để refresh real-time
- [ ] Có plan B nếu network chậm (screen recording backup)
