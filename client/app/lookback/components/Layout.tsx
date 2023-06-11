import Head from "next/head";
import type { ReactNode } from 'react';
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

type Props = {
  children: ReactNode;
  title: string
}

export const Layout = ({children, title = "Default title"}: Props) => {
  return(
    <div className="flex flex-col min-h-screen text-white font-mono bg-gray-800">
      <Head>
        <title>{title}</title>
      </Head>
      <Header></Header>
      <div className="flex flex-1 w-screen">
        <Sidebar></Sidebar>
        <main className="flex flex-1 justify-center items-center flex-col">
          {children}
        </main>
      </div>
      <footer className="w-full h-6 flex justify-center items-center text-gray-500 text-sm">
        footer
      </footer>
    </div>
  );
};
