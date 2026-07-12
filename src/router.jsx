import { useSyncExternalStore } from "react";

// Lightweight pushState router with a single shared subscription.
const listeners = new Set();
function emit() {
  listeners.forEach((fn) => fn());
}
function subscribe(cb) {
  listeners.add(cb);
  if (listeners.size === 1) window.addEventListener("popstate", emit);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) window.removeEventListener("popstate", emit);
  };
}

export function navigate(path) {
  const current = window.location.pathname + window.location.search;
  if (path === current) return;
  try {
    window.history.pushState({}, "", path);
    emit();
    window.scrollTo(0, 0);
  } catch {
    window.location.href = path;
  }
}

export function usePath() {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

export function useQuery(key) {
  return useSyncExternalStore(subscribe, () =>
    new URLSearchParams(window.location.search).get(key)
  );
}

// Renders a real <a> (SEO, middle-click, copy-link) that navigates client-side
// on plain left clicks. A user-supplied onClick may preventDefault to opt out.
export function Link({ to, onClick, children, ...props }) {
  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
