import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // React strict mode for better development experience
  reactStrictMode: true,

  // Optimize webpack configuration
  webpack: (config, { dir }) => {
    // Use dir if available (provided by Next.js), otherwise fallback to __dirname
    // dir is the project root directory where Next.js is running
    const projectRoot = dir || __dirname;
    const srcPath = path.resolve(projectRoot, 'src');
    
    // Ensure resolve.alias is an object
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    
    // Set up the @ alias to point to src directory
    // The aliases with versions (like 'vaul@1.1.2': 'vaul') are unnecessary
    // as webpack already resolves package versions correctly from package.json
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcPath,
    };

    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };

    return config;
  },
};

export default nextConfig;


