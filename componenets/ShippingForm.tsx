'use client';

import React from 'react';

type ShippingFormProps = {
  form: { [key: string]: string };
  errors?: { [key: string]: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ShippingForm({ form, errors, handleChange }: ShippingFormProps) {
  const fields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'pincode'];

  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['firstName', 'lastName'].map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
              {field === 'firstName' ? 'First Name' : 'Last Name'}
            </label>
            <input
              type="text"
              id={field}
              value={form[field]}
              onChange={handleChange}
              className={`w-full border ${errors?.[field] ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
            />
            {errors?.[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
          </div>
        ))}
      </div>
      {fields.slice(2).map((field) => (
        <div key={field}>
          <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            type="text"
            id={field}
            value={form[field]}
            onChange={handleChange}
            className={`w-full border ${errors?.[field] ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
          />
          {errors?.[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
        </div>
      ))}
    </form>
  );
}
