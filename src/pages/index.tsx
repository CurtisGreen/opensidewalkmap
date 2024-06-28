import { useEffect } from "react";
import { useRouter } from "next/router";
import { defaultViewport } from "@/config/defaults";

/**
 * The main page component that redirects visitors to a default or saved location.
 *
 * This component uses the Next.js router to redirect users based on their saved
 * latitude, longitude, and zoom level in the local storage. If no saved location
 * is found, it redirects to a default location defined in the configuration.
 * 
 * @group Pages
 */
const Home = () => {
  const router = useRouter();

  /**
   * useEffect hook to handle the redirection logic when the component is mounted.
   *
   * It retrieves the saved latitude, longitude, and zoom level from the local storage.
   * If found, it redirects to the saved location. Otherwise, it redirects to the
   * default location specified in the `defaultViewport` configuration.
   */
  useEffect(() => {
    const { longitude, latitude, zoom } = defaultViewport;

    const localLatitude = localStorage.getItem("latitude") as string;
    const localLongitude = localStorage.getItem("longitude") as string;
    const localZoom = localStorage.getItem("zoom") as string;

    if (localLatitude && localLongitude && localZoom)
      router.replace(`/${localLatitude}/${localLongitude}/${localZoom}`);
    else router.replace(`/${latitude}/${longitude}/${zoom}`);
  }, [router]);

  return <div>Redirecting...</div>;
};

export default Home;
