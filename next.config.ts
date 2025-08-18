
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  webpack: (config, { isServer }) => {
    // Ignore optional dependencies that might cause build issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Handle OpenTelemetry and other optional dependencies
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Exclude server-only packages from client bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/api': false,
        '@opentelemetry/sdk-node': false,
        '@opentelemetry/exporter-jaeger': false,
      };
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
