import CTABanner from "@/components/home/cta-banner";
import FAQ from "@/components/home/faq";
import Features from "@/components/home/features";
import HomeHero from "@/components/home/hero";
import HowItWorks from "@/components/home/how-it-works";
import Pricing from "@/components/home/pricing";
import Problem from "@/components/home/problem";
import ProductShowcase from "@/components/home/product-showcase";
import Stats from "@/components/home/stats";
import Testimonials from "@/components/home/testimonials";
import Footer from "@/components/public/footer";
import { Header } from "@/components/public/header";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HomeHero />
        <Stats />
        <ProductShowcase />
        <Problem />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
