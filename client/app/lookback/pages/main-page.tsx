import { Layout } from "@/components/Layout"
import Cookies from "universal-cookie"
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useRouter } from "next/router"; 

const cookie = new Cookies();

interface ResponseData {
  access: string;
}

export default function MainPage() {
  const router = useRouter();

  const logout = async () => {
    try {
      const response: AxiosResponse<ResponseData> = await axios.get(
          `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/auth/logout`,
          { headers: {
              "Content-Type": "application/json"
            }
          }
      );
      console.log(response);
      router.push("/");
    } catch (err: any) {
        const error: AxiosError = err;
        alert(error);
    }
  };

  return (
    <Layout title="Main Page">
      <svg
        onClick={logout}
        xmlns="http://www.w3.org/2000/svg"
        className="mt-10 cursor-pointer h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </Layout>
  )
}