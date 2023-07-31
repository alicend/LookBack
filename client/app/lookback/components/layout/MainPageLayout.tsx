import Head from "next/head";
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title: string
}

export const MainPageLayout = ({children, title = "Default title"}: Props) => {
  return(
    <div className="flex justify-center items-center flex-col min-h-screen">
      <Head>
        <title>{title}</title>
      </Head>
      <main className="flex flex-1 justify-center items-center w-screen flex-col">
        {children}
      </main>
    </div>
  );
};