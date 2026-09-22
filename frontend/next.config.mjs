/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@privacy-pay/contract'],
  distDir: '../.next'
};

export default nextConfig;
