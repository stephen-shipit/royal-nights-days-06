import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FAQAccordionProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqData = [
  {
    question: "Do I have to audition to perform?",
    answer: "Auditions are optional but highly recommended. Auditioned performers get priority booking and often deliver stronger performances. Walk-ins are accepted based on availability."
  },
  {
    question: "What if I can't sell 10 tickets?",
    answer: "The 10-ticket minimum is strictly enforced. If you cannot meet this requirement, your performance slot will be forfeited to ensure we maintain the energy and atmosphere that makes Royal Mic special."
  },
  {
    question: "How are winners chosen?",
    answer: "Winners are determined by live audience voting via QR codes. Each ticket holder gets one vote. Voting opens after all performances conclude and closes 10 minutes later."
  },
  {
    question: "Can I perform original music?",
    answer: "Absolutely! Original compositions are encouraged and often score well with audiences. Covers are also welcome. All content must be appropriate for all ages."
  },
  {
    question: "What genres are accepted?",
    answer: "We welcome R&B vocalists, neo-soul singers, jazz artists, comedians, poets, and instrumentalists. All performance styles are encouraged as long as they fit the 3-5 minute format."
  },
  {
    question: "Is there an age limit?",
    answer: "Performers must be 18 or older. We maintain an adult atmosphere while keeping content appropriate for all audiences."
  },
  {
    question: "What happens if I win?",
    answer: "Winners receive cash prizes ($600/$300/$100), professional photos, social media features across Royal Palace channels, and priority booking for future events."
  },
  {
    question: "Can I bring my own band?",
    answer: "Small acoustic ensembles (2-3 people) are welcome space permitting. Larger bands should coordinate with our team in advance. All members count toward your 10-ticket minimum."
  }
];

export default function FAQAccordion({ isOpen, onClose }: FAQAccordionProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "bg-muted/30 border-t border-secondary/20 transition-all duration-300 ease-in-out overflow-hidden",
      isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
    )}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold luxury-text">
            Frequently Asked Questions
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-secondary transition-colors"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div 
              key={index}
              className="bg-background/50 border border-secondary/20 rounded-lg overflow-hidden hover:border-secondary/40 transition-colors"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-secondary/5 transition-colors"
              >
                <h3 className="text-lg font-semibold text-foreground pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {expandedItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-secondary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                expandedItems.includes(index) ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-secondary/10 rounded-xl border border-secondary/20 text-center">
          <p className="text-secondary font-semibold mb-2">Still have questions?</p>
          <p className="text-muted-foreground">
            Contact us at <span className="text-secondary">info@royalpalacedallas.com</span> or <span className="text-secondary">(214) 555-ROYAL</span>
          </p>
        </div>
      </div>
    </div>
  );
}