import Auth from "@/components/Auth"
import { MainPageLayout } from "@/components/layout/MainPageLayout"

export default function Home() {
  return (
    <MainPageLayout title="Login">
      <Auth />
    </MainPageLayout>
  )
}
