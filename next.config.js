/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: ['cdn.discordapp.com', 'i.imgur.com'],
  },
  experimental: { serverActions: { allowedOrigins: ['*'] } }
};
