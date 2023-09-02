import PasswordReset from "@/components/PasswordReset";
import { AuthPageLayout } from "@/components/layout/AuthPageLayout";
import { EmailTokenPayload } from "@/types/URLParamType";
import jwtDecode from "jwt-decode";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const getQueryParams = (param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

export default function EmailUpdate() {
  const router = useRouter();
  const [email, setEmail] = useState("");

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
    <AuthPageLayout title="Password Reset">
      <PasswordReset email={email}/>
    </AuthPageLayout>
  )
}