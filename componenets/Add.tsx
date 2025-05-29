'use client';
import React from "react";
import Link from "next/link";

export default function Add() {
    return(
        <div className="relative bg-indigo-800 width-auto">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Summer Collection
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-indigo-200 sm:max-w-3xl">
              Discover our new arrivals with up to 40% off on selected items.
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                <Link href="/products" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 sm:px-8">
                  Shop Now
                </Link>
                <Link href="/deals" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 sm:px-8">
                  View Offers
                </Link>
              </div>
            </div>
          </div>
        </div>
    );
}