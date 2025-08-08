const HoursSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-primary mb-4">
            OPENING HOURS
          </h2>
          <p className="text-xl text-muted-foreground">
            Two distinct experiences under one roof
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Restaurant Hours */}
          <div className="bg-card p-8 rounded-2xl elegant-shadow hover:shadow-xl transition-shadow duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">
                Restaurant
              </h3>
              <p className="text-muted-foreground">Fine dining experience</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="font-medium text-primary">Monday</span>
                <span className="text-muted-foreground">Closed</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="font-medium text-primary">Tuesday</span>
                <span className="text-muted-foreground">Closed</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="font-medium text-primary">Wednesday</span>
                <span className="text-secondary font-semibold">3:00 PM - 9:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="font-medium text-primary">Thursday</span>
                <span className="text-secondary font-semibold">3:00 PM - 9:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="font-medium text-primary">Friday</span>
                <span className="text-secondary font-semibold">3:00 PM - 9:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="font-medium text-primary">Saturday</span>
                <span className="text-secondary font-semibold">3:00 PM - 9:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-primary">Sunday</span>
                <span className="text-secondary font-semibold">3:00 PM - 9:00 PM</span>
              </div>
            </div>
          </div>

          {/* Nightlife Hours */}
          <div className="bg-primary text-primary-foreground p-8 rounded-2xl elegant-shadow hover:shadow-xl transition-shadow duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍸</span>
              </div>
              <h3 className="text-3xl font-bold mb-2">
                Social
              </h3>
              <p className="text-primary-foreground/80">Lounge & entertainment</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-secondary/20">
                <span className="font-medium">Monday</span>
                <span className="text-primary-foreground/70">Closed</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-secondary/20">
                <span className="font-medium">Tuesday</span>
                <span className="text-primary-foreground/70">Closed</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-secondary/20">
                <span className="font-medium">Wednesday</span>
                <span className="text-secondary font-semibold">9:00 PM - 5:00 AM</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-secondary/20">
                <span className="font-medium">Thursday</span>
                <span className="text-secondary font-semibold">9:00 PM - 5:00 AM</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-secondary/20">
                <span className="font-medium">Friday</span>
                <span className="text-secondary font-semibold">9:00 PM - 5:00 AM</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-secondary/20">
                <span className="font-medium">Saturday</span>
                <span className="text-secondary font-semibold">9:00 PM - 5:00 AM</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-medium">Sunday</span>
                <span className="text-secondary font-semibold">9:00 PM - 5:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-lg text-muted-foreground">
            For reservations and inquiries
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <a 
              href="tel:+12145565711" 
              className="flex items-center space-x-2 text-secondary hover:text-accent transition-colors duration-300"
            >
              <span className="text-2xl">📞</span>
              <span className="text-xl font-semibold">(214) 556-5711</span>
            </a>
            <div className="hidden md:block w-px h-8 bg-border"></div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span className="text-2xl">📍</span>
              <span className="text-xl">4101 Belt Line Rd, Addison, TX 75001</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HoursSection;