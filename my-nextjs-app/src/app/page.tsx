import TestimonialsSection from "@/components/layout/Testimonial";
import CommunityHero from "@/components/ui/Communityhero";
import HeroSection from "@/components/layout/HeroPage";
import WhatsAppButton from "@/components/ui/ChatbotButton";

export default function Page() {
  return (
    <>
      <HeroSection />
      <WhatsAppButton />
      <CommunityHero />
      <TestimonialsSection />
    </>
  );
}