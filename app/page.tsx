// app/page.tsx
import Link from 'next/link';

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
