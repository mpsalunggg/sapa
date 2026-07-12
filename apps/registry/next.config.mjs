/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing the shared registry source that lives outside this app dir.
  experimental: {
    externalDir: true,
  },
}

export default nextConfig
