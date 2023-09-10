import "@/styles/globals.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import axios from "axios";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "@/store/store";

axios.defaults.withCredentials = true;

const theme = createTheme({
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "standard", // TextField のデフォルトの variant を "standard" に設定
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: "standard", // Select のデフォルトの variant を "standard" に設定
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </ThemeProvider>
  );
}
