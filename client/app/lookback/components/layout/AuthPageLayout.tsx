import Head from "next/head";
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  title: string
}

export const AuthPageLayout = ({children, title}: Props) => {
  return(
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        {children}
      </main>
    </>
  );
};