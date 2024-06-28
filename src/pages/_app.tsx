import "@/styles/globals.css";
import "@/styles/Map.css";
import "mapbox-gl/dist/mapbox-gl.css";
import type { AppProps } from "next/app";
import Head from "next/head";

/**
 * The NextJS App component initializes the pages.
 * 
 * We've used this component to:
 * - Wrap all pages on the site with a common base for the header tags.
 * 
 * See: {@link https://nextjs.org/docs/pages/building-your-application/routing/custom-app}
 * @group Pages - Overrides
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>OpenSidewalkMap</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
