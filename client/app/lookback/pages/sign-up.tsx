import jwtDecode from "jwt-decode";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import SignUp from "@/components/SignUp";
import { AuthPageLayout } from "@/components/layout/AuthPageLayout";
import {
  EmailTokenPayload,
  UserGroupIDTokenPayload,
} from "@/types/URLParamType";

const getQueryParams = (param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

const SignUpPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [userGroupID, setUserGroupID] = useState<string>("");

  useEffect(() => {
    const emailTokenFromURL = getQueryParams("email");
    const userGroupIDTokenFromURL = getQueryParams("user-group-id");

    // tokenが配列または未定義の場合にリダイレクト
    if (!emailTokenFromURL) {
      console.error("Invalid token");
      router.push("/");
      return;
    }

    try {
      const decodedEmailToken: EmailTokenPayload = jwtDecode(emailTokenFromURL);
      const currentUnixTimestamp = Math.floor(Date.now() / 1000);

      // tokenの有効期限が切れている場合にリダイレクト
      if (decodedEmailToken.exp < currentUnixTimestamp) {
        console.error("Token has expired");
        router.push("/");
        return;
      }

      setEmail(decodedEmailToken.email);
    } catch (err) {
      console.error("Error decoding Email Token:", err);
      router.push("/");
    }

    try {
      if (userGroupIDTokenFromURL) {
        const decodedUserGroupIDToken: UserGroupIDTokenPayload = jwtDecode(
          userGroupIDTokenFromURL,
        );
        setUserGroupID(decodedUserGroupIDToken.user_group_id);
      }
    } catch (err) {
      console.error("Error decoding UserGroupID Token:", err);
    }
  }, []);

  return (
    <AuthPageLayout title="Sign Up">
      {email ? (
        <SignUp email={email as string} userGroupID={userGroupID} />
      ) : (
        ""
      )}
    </AuthPageLayout>
  );
};

export default SignUpPage;
