<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name') }} - Stock Management System</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <i class="fas fa-boxes text-blue-600 text-2xl mr-3"></i>
                    <h1 class="text-xl font-semibold text-gray-900">{{ config('app.name') }}</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/api/documentation" class="text-gray-600 hover:text-gray-900">
                        <i class="fas fa-book mr-2"></i>API Docs
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div class="text-center">
                <h1 class="text-4xl font-bold mb-6">Stock Management System</h1>
                <p class="text-xl mb-8 text-blue-100">Efficient inventory tracking and distribution management for your business</p>
                <div class="flex justify-center space-x-4">
                    <a href="/api/skus" class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                        <i class="fas fa-box mr-2"></i>View Products
                    </a>
                    <a href="/api/shops" class="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition">
                        <i class="fas fa-store mr-2"></i>View Shops
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Features Section -->
    <div class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Key Features</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <div class="text-blue-600 mb-4">
                        <i class="fas fa-chart-line text-3xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Real-time Tracking</h3>
                    <p class="text-gray-600">Monitor stock levels and movements in real-time across all locations</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <div class="text-green-600 mb-4">
                        <i class="fas fa-truck text-3xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Distribution Management</h3>
                    <p class="text-gray-600">Efficiently manage stock distribution between shops and locations</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <div class="text-purple-600 mb-4">
                        <i class="fas fa-chart-bar text-3xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Comprehensive Reports</h3>
                    <p class="text-gray-600">Generate detailed reports on stock movements, balances, and spoilage</p>
                </div>
            </div>
        </div>
    </div>

    <!-- API Endpoints Section -->
    <div class="bg-gray-100 py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">API Endpoints</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h3 class="font-semibold text-gray-900 mb-2">Products</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>GET /api/skus</li>
                        <li>POST /api/skus</li>
                        <li>PUT /api/skus/{id}</li>
                    </ul>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h3 class="font-semibold text-gray-900 mb-2">Shops</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>GET /api/shops</li>
                        <li>POST /api/shops</li>
                        <li>DELETE /api/shops/{id}</li>
                    </ul>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h3 class="font-semibold text-gray-900 mb-2">Movements</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>GET /api/movements</li>
                        <li>POST /api/movements/opening</li>
                        <li>POST /api/movements/receipt</li>
                    </ul>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h3 class="font-semibold text-gray-900 mb-2">Reports</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>GET /api/reports/summary</li>
                        <li>GET /api/reports/by-shop</li>
                        <li>GET /api/reports/spoils</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <p class="text-gray-400">{{ config('app.name') }} Management System - Laravel Backend API</p>
                <p class="text-sm text-gray-500 mt-2">Built with Laravel • RESTful API • SQLite Database</p>
            </div>
        </div>
    </footer>

    <script>
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            console.log('{{ config('app.name') }} - Stock Management System');
        });
    </script>
</body>
</html>