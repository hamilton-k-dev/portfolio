import ClientPage from './ClientPage';
import { HOME_HTML } from './home-markup';

export default function HomePage() {
  return (
    <ClientPage
      html={HOME_HTML}
      bodyClass={null}
      tweaks={{ accent: '#a855f7', accent2: '#00e5ff', motion: 7, density: 1, blur: 22 }}
      scripts={[
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
        '/js/hero3d.js',
        '/js/i18n.js',
        '/js/app.js',
        '/js/lab-details.js',
        '/js/ai.js',
      ]}
    />
  );
}
