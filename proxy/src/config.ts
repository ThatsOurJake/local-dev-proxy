const config = {
  ports: {
    external: parseInt(process.env.PORT || '3000', 10),
    internal: 9897,
  },
  isProduction: process.env.NODE_ENV === 'production',
  baseDomain: process.env.BASE_DOMAIN || 'localhost:3000',
};

export default config;
