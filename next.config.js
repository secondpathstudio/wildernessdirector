/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // verification builds set NEXT_DIST_DIR so they don't clobber the dev
  // server's .next directory (which breaks the running dev session)
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
}

module.exports = nextConfig
