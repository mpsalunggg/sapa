/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing the shared registry source that lives outside this app dir.
  experimental: {
    externalDir: true,
  },
  // Keep shiki out of the server webpack bundle — bundling breaks its dynamic
  // grammar loading, which silently falls back to plaintext (no highlighting).
  serverExternalPackages: ["shiki"],
}

export default nextConfig
