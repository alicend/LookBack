import { Auth } from "@/components/Auth"
import { HomeLayout } from "@/components/HomeLayout"

export default function Home() {
  return (
    <HomeLayout title="Login">
      <Auth />
    </HomeLayout>
  )
}
