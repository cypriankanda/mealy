import { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const MealForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'price' ? parseFloat(value) || '' : value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Meal name is required';
    }
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Submission error:', err);
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: err,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formTitle = initialData.id ? `Edit Meal: ${initialData.name}` : 'Add New Meal';
  const submitButtonText = initialData.id ? 'Update Meal' : 'Create Meal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/10 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg mx-auto backdrop-blur-lg bg-white/90 border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8 lg:p-10 transform scale-95 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 via-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
          {formTitle}
        </h2>

        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
            <span className="block sm:inline">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Meal Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all duration-200 ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Chicken Stir-fry"
              required
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`mt-1 block w-full px-4 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all duration-200 ${errors.description ? 'border-red-500' : ''}`}
              placeholder="A delicious and healthy meal with..."
              required
            ></textarea>
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (KSh)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`mt-1 block w-full px-4 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all duration-200 ${errors.price ? 'border-red-500' : ''}`}
              placeholder="e.g., 550.00"
              required
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
          </div>

          {initialData.hasOwnProperty('is_active') && (
            <div className="flex items-center justify-between py-2">
              <span className="block text-sm font-medium text-gray-700">
                Available for Order
              </span>
              <label htmlFor="is_active" className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-md text-white
                         bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : submitButtonText}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
};

export default MealForm;