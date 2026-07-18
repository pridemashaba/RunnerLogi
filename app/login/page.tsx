'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/auth-client';
import { showNotification } from '@/services/notificationService';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'email') {
      if (!value) error = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email';
    } else if (name === 'password') {
      if (!value) error = 'Password is required';
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name as keyof typeof formData]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    validateField('email', formData.email);
    validateField('password', formData.password);
    if (Object.values(errors).some(Boolean)) {
      showNotification('Please fix the errors before continuing', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await login({
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      if (result === null) {
        showNotification('Login failed. Please try again.', 'error');
      } else if ('error' in result) {
        showNotification(result.error, 'error');
      } else {
        showNotification('Welcome back!', 'success');
        router.push('/dashboard');
      }
    } catch {
      showNotification('Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to RunnerLogi</h2>
          <p className="mt-2 text-sm text-gray-600">
            New to RunnerLogi?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Create an account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                className={`mt-1 block w-full rounded-lg border ${
                  touched.email && errors.email ? 'border-red-300' : 'border-gray-300'
                } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2`}
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                disabled={loading}
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  className={`mt-1 block w-full rounded-lg border ${
                    touched.password && errors.password ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 pr-10`}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
          <p className="text-center text-sm text-gray-600">
            <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
