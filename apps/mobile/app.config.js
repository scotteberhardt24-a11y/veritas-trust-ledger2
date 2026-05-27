import "dotenv/config";

export default {
  expo: {
    name: "Veritas Mobile",
    slug: "veritas-mobile",
    extra: {
      API_URL: process.env.API_URL,
      APP_NAME: process.env.APP_NAME,
    },
  },
};