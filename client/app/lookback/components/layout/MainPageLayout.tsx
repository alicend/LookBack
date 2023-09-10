import { Grid } from "@mui/material";
import Head from "next/head";
import type { ReactNode } from "react";
import { MainPageHeader } from "./MainPageHeader";
import { MessageBar } from "./MessageBar";

type Props = {
  children: ReactNode;
  title: string;
};

export const MainPageLayout = ({ children, title }: Props) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main className="text-center text-gray-600 font-serif m-6">
        <Grid container>
          <MainPageHeader title={title} />
          {children}
        </Grid>
      </main>
      <MessageBar />
    </>
  );
};
