module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      if (env === 'production') {
        // Remove CSS minimizer to avoid the error
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter(
          (minimizer) => minimizer.constructor.name !== 'CssMinimizerPlugin'
        );
      }
      return webpackConfig;
    }
  },
  jest: {
    configure: {
      transformIgnorePatterns: [
        'node_modules/(?!(fast-check)/)'
      ],
      moduleNameMapper: {
        '^fast-check$': '<rootDir>/node_modules/fast-check/lib/fast-check.js'
      }
    }
  }
};