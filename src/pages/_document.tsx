import { Html, Main, Head, NextScript } from "next/document";

/**
 * This custom Document component updates the <html> and <body> tags used to Render a page.
 * 
 * See: {@link https://nextjs.org/docs/pages/building-your-application/routing/custom-document}
 * @group Pages - Overrides
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
