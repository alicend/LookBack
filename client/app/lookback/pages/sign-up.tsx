import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jwtDecode from "jwt-decode";

import SignUp from '@/components/SignUp';
import { AuthPageLayout } from '@/components/layout/AuthPageLayout';
import { EmailTokenPayload } from "@/types/URLParamType";

const getQueryParams = (param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const SignUpPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromURL = getQueryParams('email');

    // tokenが配列または未定義の場合にリダイレクト
    if (!tokenFromURL) {
      console.error("Invalid token");
      router.push("/");
      return;
    }

    try {
      const decodedToken: EmailTokenPayload = jwtDecode(tokenFromURL);
      const currentUnixTimestamp = Math.floor(Date.now() / 1000);

      // tokenの有効期限が切れている場合にリダイレクト
      if (decodedToken.exp < currentUnixTimestamp) {
        console.error("Token has expired");
        router.push("/");
        return;
      }

      setEmail(decodedToken.email);      
    } catch (err) {
      console.error("Error decoding token:", err);
      router.push("/");
    }
  }, []);

  return (
    <AuthPageLayout title="Sign Up">
      {email ? <SignUp email={email as string} /> : ""}
    </AuthPageLayout>
  );
};

export default SignUpPage;
