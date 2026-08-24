import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,

    // 1. Keeps Turbopack happy by declaring its configuration block
    turbopack: {},

    // 2. Excludes the functions folder from the standard Webpack compilation pathway
    webpack: (config) => {
        config.watchOptions = {
            ignored: ["**/functions/**"],
        };
        return config;
    },
};

export default nextConfig;
