import Head from "next/head";
import type { ReactNode } from 'react';
import { Grid } from "@mui/material";
import { Header } from "./Header";

type Props = {
  children: ReactNode;
  title: string
}

export const MainPageLayout = ({children, title}: Props) => {
  return(
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <div className="text-center text-gray-600 font-serif m-6">
          <Grid container>
            <Header title={title}/>
            {children}
          </Grid>
        </div>
      </main>
    </>
  );
};