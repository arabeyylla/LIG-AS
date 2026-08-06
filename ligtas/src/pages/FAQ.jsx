import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from "lucide-react";
import { trackPageVisit } from '../lib/analytics';

const faqData = [
  {
    category: "General",
    questions: [
      {
        q: "What is LIG+AS?",
        a: "LIG+AS (Laro Interaktibo para sa Gabay at Ahensya ng Seguridad) is an interactive mobile game that simulates real-world disaster scenarios common in the Philippines. It's designed to teach survival skills through gamified, immersive experiences."
      },
      {
        q: "Who is LIG+AS for?",
        a: "LIG+AS is primarily designed for students and community members in the Philippines who want to improve their disaster preparedness. However, anyone interested in learning emergency survival skills through gameplay can benefit from it."
      },
      {
        q: "Is LIG+AS free?",
        a: "Yes, LIG+AS is completely free to download and play. It was developed as a capstone project with the goal of making disaster education accessible to everyone."
      },
      {
        q: "Who made LIG+AS?",
        a: "LIG+AS was developed by a team of students as a capstone project. The team includes developers, designers, and researchers passionate about using technology for disaster preparedness education. Visit our Team page to learn more."
      },
    ]
  },
  {
    category: "Platform & Installation",
    questions: [
      {
        q: "What platforms is LIG+AS available on?",
        a: "LIG+AS is currently available as an Android APK. It can be installed on any Android device running Android 7.0 (Nougat) or higher with at least 2GB of RAM."
      },
      {
        q: "How do I install the APK?",
        a: "Download the APK file from our Download page, then open it on your Android device. You may need to enable 'Install from Unknown Sources' in your device settings. Go to Settings > Security > Unknown Sources and toggle it on, then open the APK file to install."
      },
      {
        q: "Is it safe to install?",
        a: "Yes, the APK is safe to install. It was developed by our team and does not contain any malware or harmful code. The 'Unknown Sources' warning is standard for any app not downloaded from the Google Play Store."
      },
      {
        q: "Will LIG+AS be available on iOS?",
        a: "Currently, LIG+AS is only available for Android. An iOS version is not planned at this time, but the team may consider it for future development."
      },
    ]
  },
  {
    category: "Gameplay",
    questions: [
      {
        q: "What types of disasters are simulated?",
        a: "LIG+AS simulates four major disaster types common in the Philippines: Fire (structural/urban), Flood (flash and rising water), Earthquake (seismic activity and structural collapse), and Typhoon (storm surge and strong winds)."
      },
      {
        q: "How many levels are there?",
        a: "LIG+AS features multiple stages across different disaster scenarios. Each stage increases in difficulty and introduces new challenges and survival protocols to master."
      },
      {
        q: "Does the game require an internet connection?",
        a: "No, the game itself does not require an internet connection to play. It runs entirely offline on your device. This website uses Supabase for admin data management, but the game APK works independently."
      },
      {
        q: "What happens if I fail a stage?",
        a: "If you fail a stage, you can retry it immediately. Each attempt helps you learn the environment layout and improve your response time. The game encourages learning through repetition."
      },
    ]
  },
  {
    category: "Technical",
    questions: [
      {
        q: "What are the minimum device requirements?",
        a: "Android 7.0 (Nougat) or higher, at least 2GB of RAM, 500MB of free storage space, and a device with a touchscreen (for joystick controls). A device with a GPU that supports OpenGL ES 3.0 is recommended for smooth performance."
      },
      {
        q: "The game is running slowly. What can I do?",
        a: "Try closing other apps running in the background, ensure you have sufficient free storage space, and restart your device. If performance issues persist, lower the graphics settings within the game's options menu."
      },
      {
        q: "Does the game collect any personal data?",
        a: "The game itself does not collect personal data — it runs entirely offline. This website may track anonymous page visits for analytics purposes, but no personal information is required to use either the game or the site."
      },
    ]
  },
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-bold text-slate-800 pr-4">{question}</span>
        <ChevronDown
          size={20}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-8 pb-6 text-gray-600 leading-relaxed text-sm border-t border-gray-50 pt-4">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  useEffect(() => { trackPageVisit('faq'); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO */}
      <section className="relative bg-[#0a1120] text-white py-20 sm:py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a1120]"></div>
        <div className="absolute inset-0 bg-orange-500/5" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)' }}></div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-[10%] text-center">
          <div className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            Support
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-tight">
            Frequently Asked <span className="text-orange-500">Questions</span>
          </h1>
          <p className="mt-6 text-base sm:text-xl lg:text-2xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Find answers to common questions about LIG+AS, installation, gameplay, and technical requirements.
          </p>
        </div>
      </section>

      {/* FAQ CONTENT */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="px-4 sm:px-8 lg:px-[15%]">
          {faqData.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-12 last:mb-0">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle size={20} className="text-orange-500" />
                <h2 className="text-xl font-black text-slate-900">{section.category}</h2>
              </div>
              <div className="space-y-3">
                {section.questions.map((item, index) => (
                  <FAQItem key={index} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STILL HAVE QUESTIONS */}
      <section className="py-20 bg-gray-50">
        <div className="px-4 sm:px-8 lg:px-[15%] text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Still Have Questions?</h2>
          <p className="text-gray-500 text-lg mb-8">
            Can't find what you're looking for? Feel free to reach out to us through our contact form.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/download" className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all hover:-translate-y-1">
              Download LIG+AS
            </Link>
            <Link to="/about" className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-10 py-4 rounded-2xl font-bold text-lg transition-all">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
