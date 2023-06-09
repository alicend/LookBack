import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from "react-redux";
import { store } from "@/store/store";
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  )
}
