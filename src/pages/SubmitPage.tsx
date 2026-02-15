import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createAd } from '@/lib/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { AdCategory, AdDuration } from '@/types';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Spain',
  'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Switzerland', 'Austria', 'Belgium', 'Ireland', 'Portugal', 'Poland',
  'South Korea', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia',
  'Philippines', 'Vietnam', 'South Africa', 'Nigeria', 'Egypt',
  'United Arab Emirates', 'Saudi Arabia', 'Turkey', 'Russia', 'Argentina',
  'Chile', 'Colombia', 'New Zealand', 'Other'
];

const CATEGORIES: { value: AdCategory; label: string }[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'home-garden', label: 'Home & Garden' },
  { value: 'beauty', label: 'Beauty & Cosmetics' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'food-dining', label: 'Food & Dining' },
  { value: 'travel', label: 'Travel & Tourism' },
  { value: 'services', label: 'Services' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'jobs', label: 'Jobs & Careers' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'pets', label: 'Pets & Animals' },
  { value: 'other', label: 'Other' },
];

const DURATIONS: { value: AdDuration; label: string; description: string }[] = [
  { value: '1-week', label: '1 Week', description: 'Short promotional campaign' },
  { value: '2-weeks', label: '2 Weeks', description: 'Standard visibility' },
  { value: '1-month', label: '1 Month', description: 'Extended exposure' },
  { value: '2-months', label: '2 Months', description: 'Long-term promotion' },
  { value: '3-months', label: '3 Months', description: 'Maximum duration' },
];

export const SubmitPage: React.FC = () => {
  const [formData, setFormData] = useState({
    store_name: '',
    title: '',
    description: '',
    country: '',
    category: '' as AdCategory | '',
    duration: '' as AdDuration | '',
    email: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategorySelect = (category: AdCategory) => {
    setFormData((prev) => ({ ...prev, category }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: '' }));
    }
  };

  const handleDurationSelect = (duration: AdDuration) => {
    setFormData((prev) => ({ ...prev, duration }));
    if (errors.duration) {
      setErrors((prev) => ({ ...prev, duration: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please upload an image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be less than 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageData(result);
      setErrors((prev) => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.store_name.trim()) {
      newErrors.store_name = 'Store name is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Ad title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.duration) {
      newErrors.duration = 'Please select a duration';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!imageData) {
      newErrors.image = 'Please upload an image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await createAd({
        store_name: formData.store_name.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        country: formData.country,
        category: formData.category as AdCategory,
        duration: formData.duration as AdDuration,
        email: formData.email.trim(),
        image_data: imageData!,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit ad:', error);
      setErrors({ submit: 'Failed to submit ad. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl border border-neutral-200">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-8 w-8 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          
          <h2 className="mb-2 text-2xl font-bold text-neutral-900">
            Submission Received!
          </h2>
          
          <p className="mb-8 text-neutral-500">
            Your ad has been submitted and is awaiting approval. 
            You will receive a notification once it's reviewed.
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-800"
            >
              Browse Deals
            </Link>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  store_name: '',
                  title: '',
                  description: '',
                  country: '',
                  category: '',
                  duration: '',
                  email: '',
                });
                setImagePreview(null);
                setImageData(null);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-neutral-900">
            Submit Your Ad
          </h1>
          <p className="text-neutral-500">
            Share your promotional offer with customers worldwide
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-xl border border-neutral-200"
        >
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Basic Information</h2>
                <p className="text-sm text-neutral-500">Tell us about your store and promotion</p>
              </div>

              <Input
                label="Store Name"
                name="store_name"
                placeholder="Your store or business name"
                value={formData.store_name}
                onChange={handleInputChange}
                error={errors.store_name}
              />

              <Input
                label="Ad Title"
                name="title"
                placeholder="E.g., 50% Off Summer Sale"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
              />

              <Textarea
                label="Description"
                name="description"
                placeholder="Describe your promotional offer in detail..."
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Category</h2>
                <p className="text-sm text-neutral-500">Select where your ad should be listed</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategorySelect(cat.value)}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                      formData.category === cat.value
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-xs text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Duration Selection */}
            <div className="space-y-4">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Ad Duration</h2>
                <p className="text-sm text-neutral-500">Choose how long your ad should be displayed</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    type="button"
                    onClick={() => handleDurationSelect(dur.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-center transition-all ${
                      formData.duration === dur.value
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-lg font-bold">{dur.label}</span>
                    <span className={`text-xs ${
                      formData.duration === dur.value ? 'text-neutral-300' : 'text-neutral-500'
                    }`}>
                      {dur.description}
                    </span>
                  </button>
                ))}
              </div>
              {errors.duration && (
                <p className="text-xs text-red-600">{errors.duration}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Location</h2>
                <p className="text-sm text-neutral-500">Where is your store located?</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 transition-all focus:border-neutral-900 focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-xs text-red-600">{errors.country}</p>
                )}
              </div>
            </div>

            {/* Contact & Image */}
            <div className="space-y-6">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Contact & Media</h2>
                <p className="text-sm text-neutral-500">Your contact email and promotional image</p>
              </div>

              <Input
                label="Contact Email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Ad Image
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed transition-all ${
                    errors.image
                      ? 'border-red-300 bg-red-50'
                      : imagePreview
                      ? 'border-neutral-300'
                      : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative aspect-video">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                        <span className="text-sm font-medium text-white">
                          Click to change
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <svg
                        className="mb-3 h-10 w-10 text-neutral-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <p className="mb-1 text-sm font-medium text-neutral-700">
                        Click to upload image
                      </p>
                      <p className="text-xs text-neutral-500">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {errors.image && (
                  <p className="text-xs text-red-600">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              className="w-full"
            >
              Submit for Review
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-neutral-500">
            By submitting, you agree to our terms and conditions. 
            Ads are reviewed before being published.
          </p>
        </form>
      </div>
    </div>
  );
};
