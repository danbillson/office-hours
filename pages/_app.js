import "@fontsource/work-sans/300.css";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/600.css";
import "@fontsource/work-sans/700.css";
import Head from "next/head";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { colours, createColours } from "../lib/colours";

const theme = {
  colors: {
    black: "#444",
    grey: "#ccc",
  },
  ...createColours(colours),
};

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Work Sans', sans-serif;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    padding: 0;
    color: ${theme.colors.black};
    box-sizing: border-box;
  }
`;

const defaultQueryFn = async ({ queryKey }) => {
  const { data } = await axios.get(queryKey);
  return data;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Climb Office Hours</title>
        <link rel="icon" href="/favicon.ico"></link>
      </Head>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}
