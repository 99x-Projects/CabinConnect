import { Link } from 'react-router-dom';
import { NavBar } from '../components/nav-bar';
import { useCabins } from '../hooks/use-cabins';

export function CabinListPage() {
  const { cabins, loading, error, reload } = useCabins();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Cabins</h1>
          <Link
            to="/cabins/new"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            + Register cabin
          </Link>
        </div>

        {loading && <p className="text-gray-500 text-sm">Loading cabins…</p>}

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-4">
            {error}
            <button onClick={reload} className="ml-2 underline">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && cabins.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">No cabins yet</p>
            <Link to="/cabins/new" className="text-emerald-600 hover:underline text-sm">
              Register your first cabin →
            </Link>
          </div>
        )}

        <ul className="space-y-3">
          {cabins.map((cabin) => (
            <li
              key={cabin.id}
              className="bg-white rounded-lg border border-gray-200 p-5 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-gray-900 truncate">{cabin.name}</h2>
                  {!cabin.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{cabin.streetAddress}</p>
                <p className="text-sm text-gray-500">Up to {cabin.capacity} guests</p>
                {(cabin.catalogAmenities.length > 0 || cabin.customAmenities.length > 0) && (
                  <p className="text-xs text-gray-400 mt-1">
                    {[
                      ...cabin.catalogAmenities.map((a) => a.displayName),
                      ...cabin.customAmenities,
                    ].join(' · ')}
                  </p>
                )}
              </div>
              <Link
                to={`/cabins/${cabin.id}/edit`}
                className="shrink-0 text-sm text-emerald-600 hover:text-emerald-800 font-medium"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
