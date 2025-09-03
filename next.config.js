/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/rocket' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/rocket/' : '',
}

module.exports = nextConfig
