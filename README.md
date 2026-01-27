<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## CI/CD Demo - GitHub Actions → S3 → EC2

This repository demonstrates a complete CI/CD pipeline using GitHub Actions with AWS S3 and Systems Manager for secure, scalable deployment.

### Architecture

**CI Workflow** (`.github/workflows/ci.yml`)
- Runs on every push/PR to `main`
- Executes Laravel unit tests with SQLite
- Builds assets (Vite + static pages)
- Creates deployment artifact (zip)
- Uploads to **S3** using AWS OIDC (no static credentials!)

**CD Workflow** (`.github/workflows/cd-ec2.yml`)
- Triggers automatically when CI completes on `main` branch
- Uses **AWS Systems Manager (SSM)** to send deploy command
- EC2 downloads artifact from S3
- Runs migrations and optimization
- No SSH keys needed!

### Flow

```
Git push main
    ↓
GitHub Actions CI (OIDC auth)
    ↓
Build + Upload to S3
    ↓
SSM Send Command
    ↓
EC2 downloads from S3
    ↓
Deploy Laravel App
```

### Quick Start

See complete setup guide: **[docs/AWS-OIDC-SETUP.md](docs/AWS-OIDC-SETUP.md)**

**Prerequisites:**
1. AWS account with OIDC identity provider configured
2. S3 bucket for artifacts
3. EC2 instance with SSM agent + IAM role
4. SSM Document for deployment script
5. GitHub Secrets configured:
   - `AWS_ACCOUNT_ID`
   - `AWS_REGION`
   - `S3_BUCKET`
   - `SSM_DOCUMENT_NAME`
   - `EC2_INSTANCE_ID`

**To demo:**
```bash
# Make a change
echo "// Update" >> routes/web.php

# Push to trigger CI/CD
git add .
git commit -m "test: trigger deployment"
git push origin main

# Watch GitHub Actions + CloudWatch logs
```

### Why this approach?

✅ **No SSH keys** - SSM Session Manager instead  
✅ **Secure** - OIDC replaces static AWS credentials  
✅ **Traceable** - CloudWatch logs every deployment  
✅ **Scalable** - SSM can target multiple EC2 instances  
✅ **Easy rollback** - Artifacts versioned in S3

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[WebReinvent](https://webreinvent.com/)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Jump24](https://jump24.co.uk)**
- **[Redberry](https://redberry.international/laravel/)**
- **[Active Logic](https://activelogic.com)**
- **[byte5](https://byte5.de)**
- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
