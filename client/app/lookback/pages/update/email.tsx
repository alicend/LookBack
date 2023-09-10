import jwtDecode from "jwt-decode";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchAsyncUpdateCompleteLoginUserEmail } from "@/slices/userSlice";
import { AppDispatch } from "@/store/store";
import { EmailTokenPayload } from "@/types/URLParamType";

const getQueryParams = (param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

export default function EmailUpdate() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const tokenFromURL = getQueryParams("email");

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

      update(decodedToken.email);
    } catch (err) {
      console.error("Error decoding token:", err);
      router.push("/");
    }
  }, []);

  const update = async (email: string) => {
    // ログイン処理
    await dispatch(fetchAsyncUpdateCompleteLoginUserEmail(email));
  };

  return <></>;
}
