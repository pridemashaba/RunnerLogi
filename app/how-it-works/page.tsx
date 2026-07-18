// app/how-it-works/page.tsx
import Link from 'next/link';
import { 
  UserPlusIcon, 
  ClipboardDocumentListIcon, 
  TruckIcon, 
  CreditCardIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Sign up for free and set up your seller profile. Add your business details and preferred pickup locations.",
      icon: UserPlusIcon,
      color: "bg-blue-500"
    },
    {
      number: 2,
      title: "Create a Delivery Order",
      description: "Enter pickup and delivery addresses, package details, and select your preferred delivery speed.",
      icon: ClipboardDocumentListIcon,
      color: "bg-green-500"
    },
    {
      number: 3,
      title: "Compare & Choose Courier",
      description: "View real-time prices and delivery times from multiple couriers. Choose the best option for your needs.",
      icon: TruckIcon,
      color: "bg-purple-500"
    },
    {
      number: 4,
      title: "Make Payment",
      description: "Pay securely using your preferred payment method. Get instant booking confirmation.",
      icon: CreditCardIcon,
      color: "bg-orange-500"
    },
    {
      number: 5,
      title: "Track Your Delivery",
      description: "Monitor your package in real-time from pickup to delivery. Get SMS and email notifications.",
      icon: MapPinIcon,
      color: "bg-pink-500"
    },
    {
      number: 6,
      title: "Receive & Rate",
      description: "Confirm delivery receipt and rate your experience. Build your seller reputation.",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-indigo-500"
    }
  ];

  const benefits = [
    {
      title: "Bulk Shipping Discounts",
      description: "Save more when you ship multiple packages"
    },
    {
      title: "Automated Labels",
      description: "Generate shipping labels instantly"
    },
    {
      title: "Analytics Dashboard",
      description: "Track your shipping costs and performance"
    },
    {
      title: "24/7 Support",
      description: "Get help whenever you need it"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How RunnerLogi Works
          </h1>
          <p className="text-xl text-blue-100">
            Get your products delivered in 3 simple steps
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-24 left-full w-full h-0.5 bg-gray-200 -z-10"></div>
                )}
                
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
                  <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-2">Step {step.number}</div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video/Illustration Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See RunnerLogi in Action
            </h2>
            <p className="text-xl text-gray-600">
              Watch how easy it is to manage your deliveries
            </p>
          </div>
          
          <div className="bg-gray-200 rounded-xl aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-blue-700 transition-colors">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-gray-600">Demo video coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Exclusive Benefits for Sellers
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to scale your delivery operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We&apos;ve got answers
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">How much does RunnerLogi cost?</h3>
              <p className="text-gray-600">RunnerLogi is free to sign up. You only pay for the deliveries you make. We offer competitive rates with bulk discounts for high-volume sellers.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Which couriers do you work with?</h3>
              <p className="text-gray-600">              We partner with major courier services including J&T, Lalamove, GrabExpress, and more. We&apos;re constantly adding new partners to give you more options.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">How long does delivery take?</h3>
              <p className="text-gray-600">Delivery times vary by courier and location. Same-day delivery is available for select areas. You can see estimated delivery times when comparing couriers.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Is my package insured?</h3>
              <p className="text-gray-600">Yes, all deliveries come with basic insurance coverage. You can purchase additional coverage for high-value items during booking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of sellers who are already using RunnerLogi
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}