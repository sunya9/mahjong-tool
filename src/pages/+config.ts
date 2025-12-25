import vikeReact from "vike-react/config";
import type { Config } from "vike/types";

const config = {
  extends: [vikeReact],

  // https://vike.dev/clientRouting
  hydrationCanBeAborted: true,
  prerender: true,

  // https://vike.dev/meta
  meta: {
    // Define new setting 'title'
    title: {
      env: { server: true, client: true },
    },
    // Define new setting 'description'
    description: {
      env: { server: true },
    },
  },
} satisfies Config;

export default config;
