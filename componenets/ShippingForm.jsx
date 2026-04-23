"use client";

import React from "react";

export default function ShippingForm({ form, errors, handleChange }) {
  const fields = [
    "firstName",
    "lastName",
    "email",
    "address",
    "city",
    "state",
    "pincode",
  ];

  return (
    <form className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {["firstName", "lastName"].map((field) => (
          <div key={field} className="relative">
            <label
              htmlFor={field}
              className="block text-xs uppercase tracking-[0.2em] font-medium text-foreground mb-2"
            >
              {field === "firstName" ? "First Name" : "Last Name"}
            </label>
            <input
              type="text"
              id={field}
              value={form[field]}
              onChange={handleChange}
              className={`w-full bg-transparent border-0 border-b border-black/30 focus:border-black focus:ring-0 rounded-none px-0 py-2 transition-colors ${errors?.[field] ? "border-red-500" : ""}`}
            />

            {errors?.[field] && (
              <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors[field]}</p>
            )}
          </div>
        ))}
      </div>
      {fields.slice(2).map((field) => (
        <div key={field} className="relative mt-8">
          <label
            htmlFor={field}
            className="block text-xs uppercase tracking-[0.2em] font-medium text-foreground mb-2"
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            type="text"
            id={field}
            value={form[field]}
            onChange={handleChange}
            className={`w-full bg-transparent border-0 border-b border-black/30 focus:border-black focus:ring-0 rounded-none px-0 py-2 transition-colors ${errors?.[field] ? "border-red-500" : ""}`}
          />

          {errors?.[field] && (
            <p className="text-red-500 text-xs mt-1 absolute -bottom-5">{errors[field]}</p>
          )}
        </div>
      ))}
    </form>
  );
}
