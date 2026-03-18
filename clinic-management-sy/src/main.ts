
import { renderPatients }    from './components/patients.js';
import { renderAppointments } from './components/appointments.js';

type Route = 'patients' | 'appointments';

const routes: Record<Route, (container: HTMLElement) => Promise<void>> = {
  patients:     renderPatients,
  appointments: renderAppointments,
};

function getActiveRoute(): Route {
  const hash = window.location.hash.replace('#', '') as Route;
  return hash in routes ? hash : 'patients';
}

async function navigate(): Promise<void> {
  const route     = getActiveRoute();
  const container = document.getElementById('main-content');
  if (!container) return;

  document.querySelectorAll<HTMLAnchorElement>('.spa-nav-link').forEach((link) => {
    const linkRoute = link.getAttribute('data-route');
    link.classList.toggle('active', linkRoute === route);
  });

  container.innerHTML = '<div class="text-center py-5"><div class="spinner-border" role="status"></div></div>';

  try {
    await routes[route](container);
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Failed to load view: ${(err as Error).message}</div>`;
  }
}

window.addEventListener('hashchange', () => { void navigate(); });
document.addEventListener('DOMContentLoaded', () => { void navigate(); });

