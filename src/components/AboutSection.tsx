import foodImage from "@/assets/food-fusion.jpg";
const AboutSection = () => {
  return <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-primary mb-6">
                A FUSION OF
              </h2>
              <h3 className="text-3xl md:text-4xl luxury-text font-bold mb-8">MEDITERRANEAN &amp; AFRICAN FLAVORS</h3>
            </div>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>Since our founding, Royal Palace has redefined the culinary landscape with our innovative approach to Afro-Mediterranean fusion cuisine. Our master chefs craft each dish with precision and passion.</p>
              <p>
                From our signature Afro-Mediterranean spice blends to expertly crafted preparations, every element 
                is designed to create an unforgettable dining experience that seamlessly 
                transitions into sophisticated social entertainment.
              </p>
              <p>
                Join us for an evening where exceptional cuisine meets refined atmosphere, 
                where every detail reflects our commitment to luxury and excellence.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">1+</div>
                <div className="text-sm text-muted-foreground">Year of Excellence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Signature Dishes</div>
              </div>
            </div>
          </div>

          {/* Video Background */}
          <div className="relative">
            <div className="elegant-shadow rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500 relative h-[600px]">
              <video autoPlay muted loop playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover">
                <source src="https://twbqokjjdopxcgiiuluz.supabase.co/storage/v1/object/sign/assets/vidu-general-4-2025-01-26T18_35_35Z.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNmI0N2YzZS1iMTY1LTQwNTYtOGI4NS01ZDBjZWQwZWIwNDIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvdmlkdS1nZW5lcmFsLTQtMjAyNS0wMS0yNlQxOF8zNV8zNVoubXA0IiwiaWF0IjoxNzUzNzExMjU4LCJleHAiOjIwNjkwNzEyNTh9.yKDHR-SzkSVkCxhmZIk0GfjLvLZDbAjjKhskQBIFpu0" type="video/mp4" />
              </video>
              {/* Optional overlay for better text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center gold-glow">
              <span className="text-primary text-2xl">★</span>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default AboutSection;