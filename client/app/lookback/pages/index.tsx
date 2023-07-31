import Auth from "@/components/Auth"
import { AuthPageLayout } from "@/components/layout/AuthPageLayout"

export default function Home() {
  return (
    <AuthPageLayout title="Login">
      <Auth />
    </AuthPageLayout>
  )
}
