import Preloader from "@/components/layout/Preloader";
import ScrollProgress from "@/components/layout/ScrollProgress";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero2 from "@/components/sections/Hero2";
import FeatureStats2 from "@/components/sections/FeatureStats2";
import Category2 from "@/components/sections/Category2";
import TopCourses from "@/components/sections/TopCourses";
import Video2 from "@/components/sections/Video2";
import CoursesPackage from "@/components/sections/CoursesPackage";
import Brand2 from "@/components/sections/Brand2";
import Team2 from "@/components/sections/Team2";
import Testimonial2 from "@/components/sections/Testimonial2";
import App1 from "@/components/sections/App1";
import Blog2 from "@/components/sections/Blog2";
import Instagram from "@/components/sections/Instagram";

export default function Home() {
  return (
    <>
      <Preloader />
      <ScrollProgress />
      <Header />
      <main>
        <Hero2 />
        <FeatureStats2 />
        <Category2 />
        <TopCourses />
        <Video2 />
        <CoursesPackage />
        <Brand2 />
        <Team2 />
        <Testimonial2 />
        <App1 />
        <Blog2 />
        <Instagram />
      </main>
      <Footer />
    </>
  );
}
