import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Head>
          <title>Conlang Corpora</title>
          <meta name="description" content="The fastest way to check how an expression is translated into (or from) a conlang" />
          <link rel="icon" href="/favicon.ico" />
      </Head>
    </>
  )
}
export default MyApp
