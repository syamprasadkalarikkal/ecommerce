
import React, { Suspense } from 'react';
import SearchResults from '@/componenets/SearchResults';

export const dynamic = 'force-dynamic';

function Loading() {
  return <p className="text-center text-gray-600">Loading...</p>;
}

export default function SearchPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 text-black">
      <Suspense fallback={<Loading />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
