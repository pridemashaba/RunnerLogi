// app/page.tsx
import Link from 'next/link';
<<<<<<< HEAD
import Image from 'next/image';
import { TruckIcon, CurrencyDollarIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Smart Delivery for Social Media Sellers
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Compare courier prices, track deliveries, and grow your business with RunnerLogi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/how-it-works"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RunnerLogi?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage deliveries efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Couriers</h3>
              <p className="text-gray-600">
                Compare prices from top courier services and choose the best option for your needs
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Save up to 40% on shipping costs with our negotiated rates and bulk discounts
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">
                Track all your deliveries in one place with live updates and notifications
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Insurance coverage and 24/7 customer support for peace of mind
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Happy Sellers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500,000+</div>
              <div className="text-blue-100">Deliveries Completed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-blue-100">On-time Delivery Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to streamline your deliveries?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of social media sellers who trust RunnerLogi for their shipping needs
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
=======

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
              <span className="block">Logistics for</span>
              <span className="block text-blue-600">Social Media Runners</span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-lg text-gray-500 sm:text-xl md:mt-8 md:max-w-3xl">
              Compare courier prices, choose the best delivery option, and track everything in one place.
              Built specifically for social media managers and runners.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Sign In
              </Link>

            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold">Compare Prices</h3>
              <p className="mt-2 text-gray-600">See real-time rates from multiple couriers</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold">Fast Delivery</h3>
              <p className="mt-2 text-gray-600">Choose based on duration and cost</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold">Track Everything</h3>
              <p className="mt-2 text-gray-600">Real-time tracking for you and your customers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
