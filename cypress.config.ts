import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
	baseUrl: "https://mostly-mundane-movies.netlify.app/",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
