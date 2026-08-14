import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/globals.css";

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_Y2xlcmsuZXhhbXBsZSQ";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider publishableKey={publishableKey} {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
