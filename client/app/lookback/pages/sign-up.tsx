import { useRouter } from 'next/router';
import jwtDecode from "jwt-decode";

import SignUp from '@/components/SignUp';
import { AuthPageLayout } from '@/components/layout/AuthPageLayout';
import { useEffect, useState } from 'react';

interface MyTokenPayload {
  email: string;
  exp: number;
}

const SignUpPage = () => {
  const router = useRouter();
  const { token, email: encryptedEmail } = router.query;
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(token)) {
      console.error("Token should not be an array");
      return;
    }
    
    if (token && encryptedEmail) {
      const decodedToken: MyTokenPayload = jwtDecode(token);
      setEmail(decodedToken.email);

      console.log("Email from token:", email);
    }
  }, [token, encryptedEmail]);

  return (
    <AuthPageLayout title="Sign Up">
      {email ? <SignUp email={email as string} /> : ""}
    </AuthPageLayout>
  );
};

export default SignUpPage;
