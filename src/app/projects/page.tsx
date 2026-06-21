import ClientPage from '../ClientPage';
import { PROJECTS_HTML } from '../projects-markup';

export default function ProjectsPage() {
  return (
    <ClientPage
      html={PROJECTS_HTML}
      bodyClass="page-projects"
      tweaks={{ accent: '#a855f7', accent2: '#00e5ff', blur: 18 }}
      scripts={['/js/i18n.js', '/js/projects.js', '/js/chrome.js', '/js/claude-shim.js', '/js/ai.js']}
    />
  );
}
