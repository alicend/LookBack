import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
