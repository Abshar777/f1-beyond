import Preloader from "@/components/layout/Preloader";
// import ScrollProgress from "@/components/layout/ScrollProgress"; // replaced by WhatsAppButton
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import FreeAccessPopup from "@/components/layout/FreeAccessPopup";
import ContactModal from "@/components/layout/ContactModal";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero2 from "@/components/sections/Hero2";
import FeatureStats2 from "@/components/sections/FeatureStats2";
import Category2 from "@/components/sections/Category2";
import WhoWeAre from "@/components/sections/WhoWeAre";
import VisionMission from "@/components/sections/VisionMission";
import Video2 from "@/components/sections/Video2";
import Packages from "@/components/sections/Packages";
// import Brand2 from "@/components/sections/Brand2"; // partners section disabled
import PipCalculator from "@/components/sections/PipCalculator";
import Testimonials from "@/components/sections/Testimonials";
import App1 from "@/components/sections/App1";
import Faq from "@/components/sections/Faq";
import Blog2 from "@/components/sections/Blog2";
// import Instagram from "@/components/sections/Instagram"; // section disabled below

export default function Home() {
  return (
    <>
      <Preloader />
      <Header />
      <main>
        <Hero2 />
        <FeatureStats2 />
        <Category2 />
        <VisionMission />
        <WhoWeAre />
        <Video2 />
        <Packages />
        <PipCalculator />
        <Testimonials />
        <Faq />
        <App1 />
        <Blog2 />
        {/* <Instagram /> */}
      </main>
      <Footer />
      <FreeAccessPopup />
      <ContactModal />
      <WhatsAppButton />
    </>
  );
}
