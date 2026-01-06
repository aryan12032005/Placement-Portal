import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Building2, Users, Briefcase, ArrowRight, CheckCircle, 
  Star, TrendingUp, Shield, Zap, Award, Target, Play,
  Sparkles, Globe, Clock, Rocket, Heart, Menu, X, FileText, Bell,
  Search, BarChart3, MessageSquare, Lock, Layers, Cpu, UserCheck, Send,
  MousePointer, ChevronDown
} from 'lucide-react';

export const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counters, setCounters] = useState({ students: 0, companies: 0, internships: 0, stipend: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax and mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 25,
          y: (e.clientY - rect.top - rect.height / 2) / 25,
        });
      }
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsVisible(true);
    
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    const targets = { students: 8000, companies: 150, internships: 5000, stipend: 80 };
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCounters({
        students: Math.floor(targets.students * easeOut),
        companies: Math.floor(targets.companies * easeOut),
        internships: Math.floor(targets.internships * easeOut),
        stipend: Math.floor(targets.stipend * easeOut),
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  // Enhanced Features Data - Internship Focused
  const features = [
    {
      icon: Cpu,
      title: 'Smart Internship Matching',
      description: 'Our AI analyzes your skills, semester, and interests to recommend internships that perfectly align with your learning goals.',
      gradient: 'from-blue-500 to-cyan-500',
      stats: '95% Match Rate',
      details: ['Skill-based matching', 'Semester-wise filtering', 'Domain preferences', 'Duration flexibility']
    },
    {
      icon: Shield,
      title: 'Verified Internships Only',
      description: 'Every internship listing is verified to ensure genuine opportunities. No scams, no unpaid traps - only quality internships.',
      gradient: 'from-emerald-500 to-teal-500',
      stats: '150+ Companies',
      details: ['Company verification', 'Stipend confirmation', 'Work culture reviews', 'Past intern feedback']
    },
    {
      icon: Bell,
      title: 'Instant Opportunity Alerts',
      description: 'Be the first to know about new internships. Get instant notifications for openings matching your profile and preferences.',
      gradient: 'from-purple-500 to-pink-500',
      stats: 'Real-time Updates',
      details: ['Push notifications', 'Email alerts', 'Deadline reminders', 'Application updates']
    },
    {
      icon: BarChart3,
      title: 'Application Tracker',
      description: 'Monitor all your internship applications in one dashboard. Track status, deadlines, and interview schedules effortlessly.',
      gradient: 'from-orange-500 to-amber-500',
      stats: 'Stay Organized',
      details: ['Status tracking', 'Interview calendar', 'Offer comparison', 'Progress analytics']
    },
    {
      icon: FileText,
      title: 'Intern-Ready Resume',
      description: 'Build a compelling resume tailored for internships. Highlight projects, skills, and coursework that recruiters look for.',
      gradient: 'from-rose-500 to-red-500',
      stats: '30+ Templates',
      details: ['Student-focused', 'Project showcase', 'Skill highlighting', 'One-click apply']
    },
    {
      icon: MessageSquare,
      title: 'Interview Prep Kit',
      description: 'Prepare for technical rounds with curated questions, HR tips, and mock interviews from past successful interns.',
      gradient: 'from-indigo-500 to-violet-500',
      stats: '500+ Questions',
      details: ['Role-specific prep', 'Peer mock interviews', 'Company insights', 'Success stories']
    },
  ];

  // Enhanced Testimonials - Internship Success Stories
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'SDE Intern → Full-time',
      company: 'Google',
      image: 'PS',
      content: 'InternHub helped me land my dream internship at Google during my 3rd year! The AI matching found the perfect role for my skills. After a 6-month internship, I got a pre-placement offer. Best decision ever!',
      rating: 5,
      batch: '3rd Year',
      package: '₹80K/month',
      location: 'Bangalore'
    },
    {
      name: 'Rahul Verma',
      role: 'Product Intern',
      company: 'Microsoft',
      image: 'RV',
      content: 'As a 2nd year student, finding quality internships was tough. InternHub\'s verified listings saved me from fake opportunities. Got an amazing summer internship at Microsoft with great mentorship!',
      rating: 5,
      batch: '2nd Year',
      package: '₹60K/month',
      location: 'Hyderabad'
    },
    {
      name: 'Sneha Patel',
      role: 'Data Science Intern',
      company: 'Amazon',
      image: 'SP',
      content: 'The instant alerts feature is a game-changer! I applied within minutes of Amazon posting their internship and got shortlisted. The interview prep section helped me crack the technical rounds.',
      rating: 5,
      batch: '3rd Year',
      package: '₹75K/month',
      location: 'Pune'
    },
    {
      name: 'Arjun Kumar',
      role: 'Frontend Intern',
      company: 'Flipkart',
      image: 'AK',
      content: 'Coming from a tier-2 college, I never thought I\'d intern at a top startup. InternHub leveled the playing field. Applied to 10 internships, got 4 interviews, and landed at Flipkart!',
      rating: 5,
      batch: '2nd Year',
      package: '₹50K/month',
      location: 'Bangalore'
    },
    {
      name: 'Kavya Reddy',
      role: 'ML Research Intern',
      company: 'Adobe',
      image: 'KR',
      content: 'Found a research internship that perfectly matched my ML interests. The application tracker helped me manage multiple applications without missing any deadlines. Highly recommend!',
      rating: 5,
      batch: '3rd Year',
      package: '₹70K/month',
      location: 'Noida'
    },
  ];

  // Company logos with industries - Internship Partners
  const companies = [
    { name: 'Google', industry: 'Technology' },
    { name: 'Microsoft', industry: 'Technology' },
    { name: 'Amazon', industry: 'E-commerce' },
    { name: 'Flipkart', industry: 'E-commerce' },
    { name: 'Adobe', industry: 'Software' },
    { name: 'Atlassian', industry: 'Software' },
    { name: 'Razorpay', industry: 'Fintech' },
    { name: 'PhonePe', industry: 'Fintech' },
    { name: 'Swiggy', industry: 'Startup' },
    { name: 'Zomato', industry: 'Startup' },
    { name: 'CRED', industry: 'Fintech' },
    { name: 'Zerodha', industry: 'Finance' },
  ];

  // Enhanced How It Works Steps - Internship Focused
  const steps = [
    { 
      step: '01', 
      title: 'Build Your Profile', 
      description: 'Sign up, add your semester, skills, projects, and interests. Our AI creates your internship-ready profile instantly.',
      icon: UserCheck,
      color: 'violet',
      duration: '5 mins'
    },
    { 
      step: '02', 
      title: 'Discover Internships', 
      description: 'Browse curated internships or let our AI recommend opportunities matching your skills, location, and duration preferences.',
      icon: Target,
      color: 'blue',
      duration: 'Instant'
    },
    { 
      step: '03', 
      title: 'Apply & Track', 
      description: 'One-click apply to multiple internships. Track all applications, deadlines, and interview schedules in one place.',
      icon: Send,
      color: 'emerald',
      duration: 'Real-time'
    },
    { 
      step: '04', 
      title: 'Land Your Internship', 
      description: 'Ace interviews with our prep resources and secure your dream internship at top companies. Your career starts here!',
      icon: Award,
      color: 'amber',
      duration: 'Success!'
    },
  ];

  // Platform benefits for different users - Internship Focused
  const platformBenefits = {
    students: [
      'Access to 500+ verified internship opportunities',
      'AI-powered internship recommendations',
      'One-click application to multiple companies',
      'Real-time application & interview tracking',
      'Internship-specific interview prep',
      'Connect directly with hiring managers'
    ],
    companies: [
      'Access to 8000+ talented students',
      'Filter by skills, semester & CGPA',
      'Streamlined intern recruitment',
      'Campus engagement & analytics',
      'Simplified shortlisting process',
      'Build your talent pipeline early'
    ]
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Enhanced Professional Background with animated gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 via-blue-50/20 to-violet-50/20"></div>
        <div 
          className="absolute w-[900px] h-[900px] rounded-full bg-gradient-to-r from-violet-300/30 to-blue-300/30 blur-[130px] animate-blob"
          style={{ top: '-15%', left: '-10%' }}
        ></div>
        <div 
          className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-indigo-300/25 to-purple-300/25 blur-[130px] animate-blob-delay"
          style={{ bottom: '-10%', right: '-5%' }}
        ></div>
        <div 
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-300/20 to-violet-300/20 blur-[120px] animate-blob-slow"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all group-hover:scale-110 group-hover:rotate-3">
                <GraduationCap className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                InternHub
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-violet-600 font-medium transition-all hover:scale-105 relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-slate-600 hover:text-violet-600 font-medium transition-all hover:scale-105 relative group">
                How it Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-slate-600 hover:text-violet-600 font-medium transition-all hover:scale-105 relative group">
                Success Stories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button onClick={() => scrollToSection('companies')} className="text-slate-600 hover:text-violet-600 font-medium transition-all hover:scale-105 relative group">
                Companies
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </button>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-slate-700 font-semibold hover:text-violet-600 transition-all hover:scale-105">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="relative bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left bg-white/20 transition-transform duration-500"></div>
              </Link>
            </div>
            <button 
              className="md:hidden p-2 text-slate-700 hover:text-violet-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${mobileMenuOpen ? 'top-3 rotate-45' : 'top-1'}`}></span>
                <span className={`absolute left-0 top-3 w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`absolute left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${mobileMenuOpen ? 'top-3 -rotate-45' : 'top-5'}`}></span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 overflow-hidden transition-all duration-500 ${mobileMenuOpen ? 'max-h-96 py-4' : 'max-h-0'}`}>
          <div className="px-6 space-y-4">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left text-slate-600 hover:text-violet-600 font-medium py-2 transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left text-slate-600 hover:text-violet-600 font-medium py-2 transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left text-slate-600 hover:text-violet-600 font-medium py-2 transition-colors">Success Stories</button>
            <button onClick={() => scrollToSection('companies')} className="block w-full text-left text-slate-600 hover:text-violet-600 font-medium py-2 transition-colors">Companies</button>
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center text-slate-700 font-semibold py-2.5 border border-slate-200 rounded-xl hover:border-violet-300 transition-colors">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 min-h-screen flex items-center overflow-hidden">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:80px_80px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge with enhanced animation */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-blue-100 border border-violet-300/60 rounded-full px-4 py-2.5 shadow-sm hover:shadow-md hover:border-violet-400 transition-all duration-300 group">
                <Sparkles size={16} className="text-violet-600 group-hover:animate-spin-faster" />
                <span className="text-sm font-semibold text-violet-700 bg-gradient-to-r from-violet-700 to-blue-600 bg-clip-text text-transparent">#1 Internship Discovery Platform</span>
              </div>
              
              {/* Main Heading with professional styling */}
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-tight tracking-tight">
                Find Your{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                    Dream
                  </span>
                  <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 4 150 4 198 10" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                        <stop offset="0%" stopColor="#7c3aed"/>
                        <stop offset="50%" stopColor="#2563eb"/>
                        <stop offset="100%" stopColor="#4f46e5"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                  Internship
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg font-medium">
                Discover <strong className="text-slate-900 font-semibold">verified internships</strong> from <strong className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent font-semibold">150+ top companies</strong>. Get AI-matched, apply instantly, and launch your career today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link 
                  to="/register" 
                  className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Internships
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <button className="group relative inline-flex items-center justify-center gap-2 bg-white border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-violet-400 hover:bg-violet-50/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-200/50">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-all group-hover:scale-110 duration-300">
                    <Play size={18} className="text-violet-600 ml-0.5" />
                  </div>
                  How It Works
                </button>
              </div>

              {/* Trust Badges with enhanced styling */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200/50">
                <div className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
                  <div className="flex -space-x-3">
                    {['PS', 'RV', 'SP', 'AK'].map((initials, i) => (
                      <div 
                        key={i} 
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md hover:scale-110 transition-transform"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-slate-600"><strong className="text-slate-900 font-semibold">8,000+</strong> Active Students</span>
                </div>
                <div className="h-6 w-px bg-slate-300"></div>
                <div className="flex items-center gap-1 hover:scale-105 transition-transform duration-300">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-sm text-slate-600 ml-2"><strong className="text-slate-900 font-semibold">4.9/5</strong> Average</span>
                </div>
                <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
                <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Shield size={14} className="text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-600"><strong className="text-slate-900 font-semibold">100%</strong> Verified</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Visual with improved card */}
            <div 
              className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} group`}
            >
              <div className="relative">
                {/* Enhanced Glow with animation */}
                <div className="absolute -inset-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-[36px] opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>
                
                {/* Main Card with improved design */}
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-700/50 hover:border-slate-600 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-violet-600/20">
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                          <Briefcase className="text-white" size={28} />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">SDE Intern</h3>
                          <p className="text-slate-400 text-sm">Google India • Summer 2025</p>
                        </div>
                      </div>
                      <span className="bg-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        New Opening
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-slate-300 text-sm">
                        <span className="flex items-center gap-1.5 bg-slate-700/50 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"><Globe size={14} /> Bangalore</span>
                        <span className="flex items-center gap-1.5 bg-slate-700/50 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"><Clock size={14} /> 6 Months</span>
                        <span className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-300"><TrendingUp size={14} /> ₹80K/mo</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {['React', 'JavaScript', 'Python', 'Git', 'DSA'].map((skill, i) => (
                          <span 
                            key={skill} 
                            className="bg-slate-700/80 text-slate-300 px-3 py-1.5 rounded-lg text-sm hover:bg-violet-600/40 hover:text-violet-200 hover:border-violet-500 transition-all cursor-pointer border border-slate-600/50 hover:border-violet-500/50"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-slate-400">Applications</span>
                          <span className="text-white font-bold">156 applied</span>
                        </div>
                        <div className="h-2.5 bg-slate-600/50 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-pulse-slow"></div>
                        </div>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/40 transition-all duration-300 hover:scale-[1.03] relative overflow-hidden group">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Apply Now
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating Cards with animation */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                      <CheckCircle className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Application Sent!</p>
                      <p className="text-xs text-slate-500">Just now</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                      <Award className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">You're Shortlisted!</p>
                      <p className="text-xs text-slate-500">Microsoft India</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 -right-12 bg-white rounded-2xl shadow-lg p-3 border border-slate-200 hover:shadow-xl hover:scale-110 transition-all hidden lg:flex items-center gap-2 animate-pulse-slow">
                  <div className="relative">
                    <Bell className="text-violet-600" size={16} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">3 new</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Companies Marquee - Enhanced with better interactivity */}
      <section id="companies" className="py-24 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden relative">
        {/* Background Pattern with animation */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),transparent)]"></div>
        
        <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-sm">
              <Building2 size={16} /> Trusted By Industry Leaders
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Students interning at{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                150+ top companies
              </span>{' '}
              worldwide
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From startups to Fortune 500 companies - all hiring interns on InternHub
            </p>
          </div>
        </div>
        
        <div className="relative overflow-hidden">
          {/* Gradient Fades with better effect */}
          <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-white via-white to-transparent z-20 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-white via-white to-transparent z-20 pointer-events-none"></div>
          
          {/* First Row */}
          <div className="flex animate-marquee gap-6 mb-8">
            {[...companies, ...companies, ...companies].map((company, i) => (
              <div 
                key={`row1-${i}`} 
                className="flex-shrink-0 px-8 py-5 bg-white rounded-2xl border border-slate-200 hover:border-violet-400 hover:shadow-2xl hover:shadow-violet-200/50 transition-all duration-300 cursor-pointer group hover:-translate-y-2 hover:scale-105"
              >
                <p className="text-lg font-bold text-slate-600 group-hover:text-violet-600 transition-colors whitespace-nowrap">
                  {company.name}
                </p>
                <p className="text-xs text-slate-500 group-hover:text-violet-500 transition-colors mt-1 font-medium">{company.industry}</p>
              </div>
            ))}
          </div>
          
          {/* Second Row - Reverse */}
          <div className="flex animate-marqueeReverse gap-6">
            {[...companies, ...companies, ...companies].reverse().map((company, i) => (
              <div 
                key={`row2-${i}`} 
                className="flex-shrink-0 px-8 py-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 cursor-pointer group hover:-translate-y-2 hover:scale-105"
              >
                <p className="text-lg font-bold text-slate-600 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                  {company.name}
                </p>
                <p className="text-xs text-slate-500 group-hover:text-indigo-500 transition-colors mt-1 font-medium">{company.industry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Clean and Professional */}
      <section id="stats" className="py-24 relative overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-[length:60px_60px]"></div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 animate-fadeInUp">
              Internships That{' '}
              <span className="relative inline-block">
                Launch Careers
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="200" strokeDashoffset="200" className="animate-drawLineWhite"/>
                </svg>
              </span>
            </h2>
            <p className="text-violet-200 text-lg max-w-2xl mx-auto animate-fadeInUp animation-delay-300">
              Join thousands of students who've kickstarted their careers with InternHub
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: counters.students, suffix: '+', label: 'Students Registered', icon: Users, description: 'Active profiles' },
              { value: counters.companies, suffix: '+', label: 'Partner Companies', icon: Building2, description: 'Hiring interns' },
              { value: counters.internships, suffix: '+', label: 'Internships Secured', icon: Briefcase, description: 'And counting' },
              { value: counters.stipend, suffix: 'K', label: 'Highest Stipend', icon: TrendingUp, description: 'Per month' },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="group relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer animate-fadeInUp"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <stat.icon className="text-white" size={28} />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white mb-1 tabular-nums">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <p className="text-white font-semibold mb-1">{stat.label}</p>
                  <p className="text-violet-200 text-sm">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with Interactive Cards */}
      <section id="features" className="py-24 bg-white relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Zap size={16} /> Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Everything You Need to{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Land Your Internship
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-violet-200/50 -z-10 skew-x-12"></div>
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              A comprehensive platform designed to maximize your internship success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className={`group relative bg-white rounded-3xl p-8 border border-slate-100 transition-all duration-500 cursor-pointer overflow-hidden ${activeFeature === i ? 'scale-105 shadow-2xl border-violet-300 z-10' : 'hover:shadow-xl hover:-translate-y-2'}`}
                onMouseEnter={() => setActiveFeature(i)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                {/* Animated gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Decorative circle */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500 group-hover:scale-150`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <feature.icon size={28} />
                    </div>
                    <span className={`text-xs font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent px-3 py-1 rounded-full border border-current opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0`}>
                      {feature.stats}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-violet-700 transition-colors">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, j) => (
                      <li 
                        key={j} 
                        className="flex items-center gap-2 text-sm text-slate-500 transition-all duration-300"
                        style={{ 
                          transitionDelay: `${j * 50}ms`,
                          opacity: activeFeature === i ? 1 : 0.7,
                          transform: activeFeature === i ? 'translateX(0)' : 'translateX(-8px)'
                        }}
                      >
                        <CheckCircle size={14} className={`bg-gradient-to-r ${feature.gradient} rounded-full text-white p-0.5`} />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Bottom gradient line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Enhanced with Timeline Animation */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
        {/* Decorative elements removed for professionalism */}
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Rocket size={16} className="animate-bounce" /> Simple 4-Step Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From registration to placement - we've simplified every step
            </p>
          </div>

          {/* Process Flow Diagram - Enhanced */}
          <div className="relative max-w-5xl mx-auto mb-16">
            {/* Animated connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-400 via-blue-400 via-emerald-400 to-amber-400 animate-progressLine"></div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {steps.map((item, i) => (
                <div key={i} className="relative group">
                  <div 
                    className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 group-hover:border-violet-200 group-hover:-translate-y-4"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    {/* Animated background on hover */}
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${
                      item.color === 'violet' ? 'from-violet-50 to-violet-100' :
                      item.color === 'blue' ? 'from-blue-50 to-blue-100' :
                      item.color === 'emerald' ? 'from-emerald-50 to-emerald-100' :
                      'from-amber-50 to-amber-100'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    <div className="relative z-10">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${
                        item.color === 'violet' ? 'from-violet-500 to-violet-600' :
                        item.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        item.color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
                        'from-amber-500 to-amber-600'
                      } flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                        <item.icon size={28} />
                      </div>
                      <div className="text-center">
                        <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2 ${
                          item.color === 'violet' ? 'bg-violet-100 text-violet-600' :
                          item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>{item.duration}</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    </div>
                    
                    {/* Animated pulse ring */}
                    <div className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity ${
                      item.color === 'violet' ? 'bg-violet-400' :
                      item.color === 'blue' ? 'bg-blue-400' :
                      item.color === 'emerald' ? 'bg-emerald-400' :
                      'bg-amber-400'
                    } blur-xl -z-10`}></div>
                  </div>
                  
                  {/* Step Number - Enhanced */}
                  <div className={`absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-20 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 ${
                    item.color === 'violet' ? 'bg-gradient-to-br from-violet-500 to-violet-700' :
                    item.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                    item.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                    'bg-gradient-to-br from-amber-500 to-amber-700'
                  }`}>
                    {i + 1}
                  </div>
                  
                  {/* Arrow connector for desktop */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 -translate-y-1/2 z-20">
                      <ArrowRight className="text-slate-300 group-hover:text-violet-400 transition-colors" size={24} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Platform Benefits - Enhanced */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <div className="group relative bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border border-violet-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              {/* Decorative blob */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-200 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <GraduationCap className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">For Students</h3>
                    <p className="text-sm text-violet-600">Start your career journey</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {platformBenefits.students.map((benefit, i) => (
                    <li 
                      key={i} 
                      className="flex items-center gap-3 group/item hover:translate-x-2 transition-transform duration-300"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all group/btn"
                >
                  Register as Student 
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-8 border border-emerald-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              {/* Decorative blob */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-200 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Building2 className="text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">For Companies</h3>
                    <p className="text-sm text-emerald-600">Find top talent early</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {platformBenefits.companies.map((benefit, i) => (
                    <li 
                      key={i} 
                      className="flex items-center gap-3 group/item hover:translate-x-2 transition-transform duration-300"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all group/btn"
                >
                  Register as Company 
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Enhanced with 3D Card Flip */}
      <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.05),transparent_50%)]"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Heart size={16} className="text-pink-500" /> Intern Success Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Students Love{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">InternHub</span>
                <Sparkles size={20} className="absolute -top-4 -right-6 text-amber-400" />
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Real stories from students who landed their dream internships
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Main Testimonial Card - Enhanced */}
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 border border-slate-700/50 shadow-2xl overflow-hidden hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 group">
              
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Quote decoration */}
              <div className="absolute top-4 left-6 text-slate-700 text-8xl font-serif leading-none select-none">"</div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-1 mb-6">
                  {[1,2,3,4,5].map(i => (
                    <Star 
                      key={i} 
                      size={24} 
                      className="text-amber-400 fill-amber-400 group-hover:animate-spin-faster" 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                
                <blockquote className="text-xl md:text-2xl font-medium text-white mb-10 leading-relaxed transition-all duration-500 group-hover:text-violet-100">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300 ring-4 ring-slate-900">
                        {testimonials[activeTestimonial].image}
                      </div>
                      {/* Verified badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg">
                        <CheckCircle size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{testimonials[activeTestimonial].name}</p>
                      <p className="text-slate-400">
                        {testimonials[activeTestimonial].role} at{' '}
                        <span className="font-semibold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                          {testimonials[activeTestimonial].company}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 border border-emerald-500/30">
                      <TrendingUp size={14} />
                      {testimonials[activeTestimonial].package}
                    </span>
                    <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/10 border border-blue-500/30">
                      <Globe size={14} />
                      {testimonials[activeTestimonial].location}
                    </span>
                    <span className="bg-violet-500/20 text-violet-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-violet-500/10 border border-violet-500/30">
                      <GraduationCap size={14} />
                      {testimonials[activeTestimonial].batch}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation - Professional */}
            <div className="flex justify-center gap-4 mt-12">
              {testimonials.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 hover:scale-110 ${
                    i === activeTestimonial 
                      ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white scale-125 shadow-xl shadow-violet-500/40 ring-4 ring-violet-400/50' 
                      : 'bg-white text-slate-700 shadow-lg hover:shadow-violet-200 border-2 border-slate-200'
                  }`}
                >
                  {t.image}
                  {i === activeTestimonial && (
                    <span className="absolute inset-0 rounded-full border-2 border-violet-300 animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Progress bar - Enhanced */}
            <div className="flex justify-center gap-2.5 mt-8">
              {testimonials.map((_, i) => (
                <div key={i} className="h-1.5 w-14 rounded-full bg-slate-300 overflow-hidden shadow-sm">
                  <div 
                    className={`h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 transition-all duration-300 rounded-full ${
                      i === activeTestimonial ? 'w-full animate-progressTestimonial shadow-lg shadow-violet-500/50' : 'w-0'
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Enhanced with Bento Grid */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Award size={16} className="animate-bounce-subtle" /> Why InternHub
              </span>
              <h2 className="text-4xl font-black text-slate-900 mb-6">
                The Trusted Choice for{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Student Internships
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-violet-200 to-indigo-200 -z-10 skew-x-6 rounded"></div>
                </span>
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                We've built a platform that truly understands what students need to land their first industry experience.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Lock, title: 'Secure & Private', desc: 'Your data is encrypted and never shared without consent', color: 'violet' },
                  { icon: Layers, title: 'Easy Integration', desc: 'Seamless integration with college placement cells', color: 'indigo' },
                  { icon: Search, title: 'Smart Filters', desc: 'Find exactly what you need with powerful search filters', color: 'purple' },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="group flex items-start gap-4 bg-white rounded-2xl p-4 border border-slate-100 hover:border-violet-200 hover:shadow-xl transition-all duration-300 hover:-translate-x-2 cursor-pointer"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <item.icon className="text-violet-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                    <ArrowRight className="text-slate-300 group-hover:text-violet-500 group-hover:translate-x-2 transition-all ml-auto self-center" size={20} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bento Grid Stats */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '95%', label: 'Match Accuracy', icon: Target, color: 'from-violet-500 to-violet-600' },
                  { value: '24/7', label: 'Support Available', icon: Clock, color: 'from-blue-500 to-blue-600' },
                  { value: '<5 min', label: 'Avg Response Time', icon: Zap, color: 'from-amber-500 to-amber-600' },
                  { value: '100%', label: 'Free for Students', icon: Heart, color: 'from-pink-500 to-pink-600' },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className={`group bg-white rounded-3xl p-6 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${i === 0 ? 'col-span-2' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                        <item.icon size={24} />
                      </div>
                      {i === 0 && (
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                      )}
                    </div>
                    <p className={`text-${i === 0 ? '4xl' : '3xl'} font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>{item.value}</p>
                    <p className="text-slate-600 font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
              
              {/* Decorative element */}
              <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-violet-200 to-indigo-200 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Professional and Impactful */}
      <section className="py-32 relative overflow-hidden">
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-900/80 to-indigo-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(168,85,247,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.2),transparent_50%)]"></div>
        </div>
        
        {/* Animated blobs */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-blob-delay"></div>
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-5 py-3 rounded-full mb-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group animate-fadeInUp">
            <Sparkles size={18} className="text-violet-400 group-hover:animate-spin-faster" />
            <span className="text-sm font-semibold text-violet-200">Join 8,000+ students landing dream internships</span>
          </div>
          
          <h2 className="text-4xl md:text-7xl font-black text-white mb-6 animate-fadeInUp animation-delay-200 leading-tight">
            Ready to Land Your{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
                Dream Internship?
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 via-pink-400 to-indigo-400 opacity-50"></div>
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto animate-fadeInUp animation-delay-400 leading-relaxed font-medium">
            Your career journey starts with the right internship. Join India's most trusted internship platform and unlock opportunities at top companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animation-delay-600">
            <Link 
              to="/register" 
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-12 py-5 rounded-2xl font-bold text-lg overflow-hidden shadow-xl shadow-violet-600/30 hover:shadow-2xl hover:shadow-violet-600/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Exploring Now
                <Rocket size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-full transition-all duration-700"></div>
            </Link>
            <Link 
              to="/login" 
              className="group relative inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-xl text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-white/25 transition-all border-2 border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl"
            >
              Sign In
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-16 animate-fadeInUp animation-delay-800 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-violet-500/30 transition-colors flex items-center justify-center">
                <Shield size={18} />
              </div>
              <span className="text-sm font-semibold">Secure & Private</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-indigo-500/30 transition-colors flex items-center justify-center">
                <Zap size={18} />
              </div>
              <span className="text-sm font-semibold">Instant Access</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-pink-500/30 transition-colors flex items-center justify-center">
                <Heart size={18} />
              </div>
              <span className="text-sm font-semibold">100% Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-slate-900 py-16 border-t border-slate-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(124,58,237,0.1),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 group-hover:scale-110 transition-all">
                  <GraduationCap className="text-white" size={26} />
                </div>
                <span className="text-2xl font-bold text-white">InternHub</span>
              </Link>
              <p className="text-slate-400 leading-relaxed">
                India's #1 internship discovery platform. Connecting talented students with quality internship opportunities since 2024.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {[
                  { href: 'https://twitter.com', color: 'hover:bg-blue-500', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { href: 'https://linkedin.com', color: 'hover:bg-blue-600', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                  { href: 'https://instagram.com', color: 'hover:bg-pink-600', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
                  { href: 'mailto:contact@uniplace.in', color: 'hover:bg-emerald-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                ].map((social, i) => (
                  <a 
                    key={i}
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`w-10 h-10 bg-slate-800 ${social.color} rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110 hover:-translate-y-1`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <Layers size={18} className="text-violet-400" />
                Platform
              </h4>
              <ul className="space-y-3">
                {[
                  { to: '/register', icon: GraduationCap, label: 'For Students' },
                  { to: '/register', icon: Building2, label: 'For Companies' },
                  { action: () => scrollToSection('features'), icon: Sparkles, label: 'Features' },
                  { action: () => scrollToSection('how-it-works'), icon: Rocket, label: 'How it Works' },
                ].map((item, i) => (
                  <li key={i}>
                    {item.to ? (
                      <Link to={item.to} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                        <item.icon size={14} className="text-violet-400 group-hover:scale-110 transition-transform" />
                        <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                      </Link>
                    ) : (
                      <button onClick={item.action} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                        <item.icon size={14} className="text-violet-400 group-hover:scale-110 transition-transform" />
                        <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <FileText size={18} className="text-violet-400" />
                Resources
              </h4>
              <ul className="space-y-3">
                {[
                  { action: () => scrollToSection('stats'), icon: TrendingUp, label: 'Placement Stats' },
                  { action: () => scrollToSection('testimonials'), icon: Star, label: 'Success Stories' },
                  { action: () => scrollToSection('companies'), icon: Building2, label: 'Partner Companies' },
                  { href: '#', icon: FileText, label: 'Career Blog' },
                ].map((item, i) => (
                  <li key={i}>
                    {item.href ? (
                      <a href={item.href} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                        <item.icon size={14} className="text-violet-400 group-hover:scale-110 transition-transform" />
                        <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                      </a>
                    ) : (
                      <button onClick={item.action} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                        <item.icon size={14} className="text-violet-400 group-hover:scale-110 transition-transform" />
                        <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <Rocket size={18} className="text-violet-400" />
                Get Started
              </h4>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Ready to land your first internship? Create your free account and start exploring opportunities today.</p>
              <Link 
                to="/register" 
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all text-sm"
              >
                Create Account
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm flex items-center gap-2">
              © 2025 InternHub. All rights reserved. Built with 
              <Heart size={14} className="text-pink-500" />
              for students.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors hover:-translate-y-0.5 inline-block">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors hover:-translate-y-0.5 inline-block">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors hover:-translate-y-0.5 inline-block">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles with Enhanced Animations */}
      <style>{`
        /* Blob Animations - Smooth floating effect */
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes blob-delay {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-30px, 30px) scale(0.95); }
          50% { transform: translate(20px, -30px) scale(1.1); }
          75% { transform: translate(-50px, -20px) scale(0.9); }
        }
        
        @keyframes blob-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.05); }
          66% { transform: translate(-40px, 40px) scale(0.95); }
        }
        
        .animate-blob { animation: blob 8s infinite; }
        .animate-blob-delay { animation: blob-delay 10s infinite 2s; }
        .animate-blob-slow { animation: blob-slow 12s infinite 1s; }
        
        /* Floating Card Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 3.5s ease-in-out infinite 0.2s; }
        
        /* Pulse Animations */
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse-slow { animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        
        /* Spin Faster */
        @keyframes spin-faster {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-spin-faster { animation: spin-faster 1s linear infinite; }
        
        /* Marquee Animations */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        
        @keyframes marqueeReverse {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        
        .animate-marquee { animation: marquee 40s linear infinite; }
        .animate-marqueeReverse { animation: marqueeReverse 40s linear infinite; }
        
        /* Progress Animations */
        @keyframes progressBar {
          0% { width: 0; }
          100% { width: 75%; }
        }
        
        @keyframes progressLine {
          0% { width: 0; }
          100% { width: 100%; }
        }
        
        @keyframes progressTestimonial {
          0% { width: 0; }
          100% { width: 100%; }
        }
        
        .animate-progressBar { animation: progressBar 2s ease-out forwards; }
        .animate-progressLine { animation: progressLine 2s ease-out forwards; }
        .animate-progressTestimonial { animation: progressTestimonial 5s linear; }
        
        /* Fade and Slide Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out forwards; }
        
        /* Hover Effect */
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        
        /* Glow Effect */
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.3); }
          50% { box-shadow: 0 0 30px rgba(124, 58, 237, 0.5); }
        }
        
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        
        /* Animation Delays */
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-900 { animation-delay: 0.9s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        /* Hover Transitions */
        .group:hover .group-hover\\:translate-x-2 { transform: translateX(0.5rem); }
        
        /* Initial state for animated elements */
        .animate-fadeInUp { opacity: 0; }
        
        /* Smooth scroll behavior */
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};
