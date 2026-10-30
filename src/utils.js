// import.meta.env.BASE_URL is '/' locally and '/repo-name/' on GitHub Pages.
export function asset(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
