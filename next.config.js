/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supabase auth uses navigator.locks internally. React Strict Mode's
  // double-invoke of useEffect leaves an orphaned lock in dev, causing
  // all subsequent Supabase calls to hang for 5s. Disable until Supabase
  // ships a fix for this.
  reactStrictMode: false,
};
module.exports = nextConfig;
