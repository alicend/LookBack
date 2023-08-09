import Auth from "@/components/Auth"
import { AuthPageLayout } from "@/components/layout/AuthPageLayout"
import { fetchAsyncGetUserGroups } from "@/slices/userGroupSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

export default function Home() {

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const fetchBootLoader = async () => {
      await dispatch(fetchAsyncGetUserGroups());
    };
    fetchBootLoader();
  }, [dispatch]);
  
  return (
    <AuthPageLayout title="Login">
      <Auth />
    </AuthPageLayout>
  )
}
