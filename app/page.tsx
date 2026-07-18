// app/page.tsx
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Shield, TrendingUp, Star, Package } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      title: "Smart Price Comparison",
      description: "Real-time rates from multiple couriers with AI-powered recommendations.",
      stat: "Save up to 40%"
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: "Express Delivery Network",
      description: "Same-day, next-day, or express options with real-time ETAs.",
      stat: "Avg. 45 min"
    },
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: "Live Tracking Suite",
      description: "GPS-enabled tracking with automated customer notifications.",
      stat: "99.9% on-time"
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Comprehensive Insurance",
      description: "Automatic coverage per delivery with premium options.",
      stat: "$5,000 coverage"
    },
    {
      icon: <Star className="h-6 w-6 text-blue-600" />,
      title: "Verified Runner Network",
      description: "Background-checked runners with performance ratings.",
      stat: "4.89★ rating"
    },
    {
      icon: <Package className="h-6 w-6 text-blue-600" />,
      title: "Bulk Operations",
      description: "Route optimization and batch scheduling for high volumes.",
      stat: "100+ orders/hour"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-blue-600">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Smart Delivery for{' '}
            <span className="text-white">Social Media Sellers</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            Compare courier prices, track deliveries, and grow your business with RunnerLogi
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-lg bg-transparent px-6 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white hover:bg-white/10 transition"
            >
              How It Works
            </Link>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose RunnerLogi?</h2>
            <p className="mt-2 text-gray-600">Everything you need to manage deliveries efficiently</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition">
                <div className="mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
                <p className="mt-3 text-sm font-medium text-blue-600">{feature.stat}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Ready to streamline your deliveries?</h2>
            <p className="mt-2 text-gray-600">Join thousands of sellers who trust RunnerLogi</p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center mt-6 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}