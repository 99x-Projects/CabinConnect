import { useTranslation } from 'react-i18next';
import { mockCabinDetailResponse } from '../mocks/cabin-mock';
import { Button } from '../components/ui/Button';

// CabinProfile — the Bolt 1 demonstrable.
// Renders a real cabin profile screen against typed mock data. When Bolt 2 ships,
// the `mockCabinDetailResponse` import is swapped for `await fetch('/cabins/{id}')`.

export function CabinProfile() {
  const { t, i18n } = useTranslation();
  const { cabin } = mockCabinDetailResponse;

  const toggleLocale = () => {
    void i18n.changeLanguage(i18n.language === 'nb-NO' ? 'en' : 'nb-NO');
  };

  return (
    <main className="max-w-2xl mx-auto p-6 font-sans text-text">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-primary">{cabin.name}</h1>
          <p className="text-text-muted mt-1">{cabin.location}</p>
        </div>
        <Button variant="ghost" onClick={toggleLocale} aria-label={t('app.toggleLocale')}>
          {i18n.language === 'nb-NO' ? 'EN' : 'NB'}
        </Button>
      </header>

      <section className="bg-surface-raised border border-border rounded-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">{t('cabin.capacity')}</h2>
        <p>
          {cabin.capacity} {t('cabin.guests')}
        </p>
      </section>

      <section className="bg-surface-raised border border-border rounded-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">{t('cabin.amenities')}</h2>
        <ul className="flex flex-wrap gap-2">
          {cabin.amenityTags.map((tag) => (
            <li
              key={tag}
              className="px-3 py-1 rounded-pill border border-border text-sm text-text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </section>

      <footer className="flex gap-3 mt-6">
        <Button variant="primary">{t('cabin.editProfile')}</Button>
        <Button variant="secondary">{t('cabin.shareVisitorInstructions')}</Button>
      </footer>

      <p className="mt-8 text-xs text-text-muted">
        {t('app.mockNotice')}
      </p>
    </main>
  );
}
