import { useState, FormEvent } from "react"; 
import { useRouter } from "next/router"; 
import axios, { AxiosResponse, AxiosError } from 'axios';
import { ResponseData } from "@/types/ResponseData";

export const Auth = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const login = async () => {
    try {
      const response: AxiosResponse<ResponseData> = await axios.post(
          `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/auth/login`,
          { email: email, password: password },
          { headers: {
              "Content-Type": "application/json"
            }
          }
      )

      console.log(response);
      router.push("/main-page");
    } catch (err: any) {
      console.log(err);
      
      const error: AxiosError = err;
      if (error.response && error.response.status === 400) {
          alert("authentication failed");
      } else {
          alert(error);
      }
    }
  };

  const authUser = async (e: FormEvent) => {
    // ページのリロードを防ぐ(submitイベントの本来の動作を止める)
    e.preventDefault();

    if (isLogin) {
      login();
    } else {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/auth/signup`,
          { name: userName, email: email, password: password },
          { headers: {
              "Content-Type": "application/json"
            }
          }
        );
        login();
      } catch (err) {
        console.log(err);
        alert(err);
      }
    }
  };

  return(
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-10 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          {isLogin ? "ログイン" : "新規登録"}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={authUser}>
        {isLogin ?
          ""
        : 
        <div>
          <label htmlFor="userName" className="block text-sm font-medium leading-6 text-white">User Name</label>
          <div className="mt-2">
            <input
              id="userName"
              name="userName"
              type="text"
              autoComplete="name"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={userName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUserName(e.target.value);
              }}
            />
          </div>
        </div>
        }
          

          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">Email</label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">Password</label>
              <div className="text-sm mr-2">
                <a href="#" className="font-semibold text-indigo-500 hover:text-indigo-400">パスワードを忘れた</a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
          </div>

          <div>
            <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              {isLogin ? "Sign in" : "Sign up"}
            </button>
          </div>
        </form>

        <div className="mt-2 mr-2 text-right text-sm" >
          <span onClick={() => setIsLogin(!isLogin)} className="cursor-pointer font-semibold leading-6 text-indigo-500 hover:text-indigo-400">
            {isLogin ? "新規登録する" : "ログインする"}
          </span>
        </div>
      </div>
    </>
  );
};