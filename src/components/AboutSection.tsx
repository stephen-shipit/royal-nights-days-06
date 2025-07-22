import foodImage from "@/assets/food-fusion.jpg";

const AboutSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-primary mb-6 font-['Playfair_Display']">
                A FUSION OF
              </h2>
              <h3 className="text-3xl md:text-4xl luxury-text font-bold mb-8 font-['Playfair_Display']">
                MEDITERRANEAN & AMERICAN FLAVORS
              </h3>
            </div>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Since our founding, Royal Palace has redefined the culinary landscape with our 
                innovative approach to Mediterranean-American fusion cuisine. Our master chefs 
                craft each dish with precision and passion.
              </p>
              <p>
                From our signature wood-fired dishes to handcrafted cocktails, every element 
                is designed to create an unforgettable dining experience that seamlessly 
                transitions into sophisticated nightlife.
              </p>
              <p>
                Join us for an evening where exceptional cuisine meets refined atmosphere, 
                where every detail reflects our commitment to luxury and excellence.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">7+</div>
                <div className="text-sm text-muted-foreground">Years of Excellence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Signature Dishes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">200+</div>
                <div className="text-sm text-muted-foreground">Premium Spirits</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="elegant-shadow rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
              <img 
                src={foodImage} 
                alt="Mediterranean fusion cuisine"
                className="w-full h-[600px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center gold-glow">
              <span className="text-primary text-2xl">★</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;