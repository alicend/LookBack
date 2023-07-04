import Head from "next/head";
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title: string
}

export const HomeLayout = ({children, title = "Default title"}: Props) => {
  return(
    <div className="flex justify-center items-center flex-col min-h-screen">
      <Head>
        <title>{title}</title>
      </Head>
      <main className="flex flex-1 justify-center items-center w-screen flex-col">
        {children}
      </main>
      <footer className="w-full h-6 flex justify-center items-center text-gray-500 text-sm">
        footer
      </footer>
    </div>
  );
};