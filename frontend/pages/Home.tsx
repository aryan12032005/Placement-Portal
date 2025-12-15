import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Building2, Users, Briefcase, ArrowRight, CheckCircle, 
  Star, TrendingUp, Shield, Zap, Award, Target, Play,
  Sparkles, Globe, Clock, Rocket, Heart, Menu, X, FileText, Bell,
  Search, BarChart3, MessageSquare, Lock, Layers, Cpu, UserCheck, Send
} from 'lucide-react';

export const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counters, setCounters] = useState({ students: 0, companies: 0, placements: 0, packages: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    const targets = { students: 5000, companies: 200, placements: 3500, packages: 45 };
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCounters({
        students: Math.floor(targets.students * easeOut),
        companies: Math.floor(targets.companies * easeOut),
        placements: Math.floor(targets.placements * easeOut),
        packages: Math.floor(targets.packages * easeOut),
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

  // Enhanced Features Data
  const features = [
    {
      icon: Cpu,
      title: 'AI-Powered Job Matching',
      description: 'Our intelligent algorithms analyze your skills, experience, and preferences to recommend the perfect job opportunities with 95% accuracy.',
      gradient: 'from-blue-500 to-cyan-500',
      stats: '95% Match Rate',
      details: ['Skill-based matching', 'CGPA requirements', 'Location preferences', 'Salary expectations']
    },
    {
      icon: Shield,
      title: 'Verified & Trusted Companies',
      description: 'Every company undergoes rigorous verification to ensure authentic opportunities. No fake listings, only genuine offers.',
      gradient: 'from-emerald-500 to-teal-500',
      stats: '200+ Partners',
      details: ['Background checks', 'Company reviews', 'Salary verification', 'Interview feedback']
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Never miss an opportunity. Get instant alerts for new jobs, application updates, interview schedules, and offer letters.',
      gradient: 'from-purple-500 to-pink-500',
      stats: 'Instant Alerts',
      details: ['Push notifications', 'Email updates', 'SMS alerts', 'Calendar sync']
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track your progress with detailed analytics. See application trends, interview performance, and placement statistics.',
      gradient: 'from-orange-500 to-amber-500',
      stats: 'Deep Insights',
      details: ['Application tracking', 'Success metrics', 'Industry trends', 'Salary insights']
    },
    {
      icon: FileText,
      title: 'Resume Builder',
      description: 'Create ATS-friendly resumes with our professional templates. Stand out from the crowd with a polished profile.',
      gradient: 'from-rose-500 to-red-500',
      stats: '50+ Templates',
      details: ['ATS optimization', 'PDF export', 'Multiple formats', 'Expert tips']
    },
    {
      icon: MessageSquare,
      title: 'Interview Preparation',
      description: 'Access curated interview questions, mock tests, and expert tips for top companies to ace your interviews.',
      gradient: 'from-indigo-500 to-violet-500',
      stats: '1000+ Questions',
      details: ['Company-specific', 'Video tutorials', 'Mock interviews', 'Feedback system']
    },
  ];

  // Enhanced Testimonials
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      company: 'Google',
      image: 'PS',
      content: 'UniPlace transformed my placement journey. Within a week of registering, I received interview calls from 5 top companies. The AI matching was incredibly accurate - every opportunity aligned with my skills and career goals.',
      rating: 5,
      batch: '2024',
      package: '₹32 LPA',
      location: 'Bangalore'
    },
    {
      name: 'Rahul Verma',
      role: 'Product Manager',
      company: 'Microsoft',
      image: 'RV',
      content: 'The platform\'s real-time notifications kept me ahead of the competition. I never missed a deadline or update. The interview prep resources were invaluable - I walked into every interview feeling confident.',
      rating: 5,
      batch: '2024',
      package: '₹28 LPA',
      location: 'Hyderabad'
    },
    {
      name: 'Sneha Patel',
      role: 'Data Scientist',
      company: 'Amazon',
      image: 'SP',
      content: 'From resume building to final offer, UniPlace guided me through every step. The analytics dashboard helped me understand where I stood and what to improve. Landed my dream job with a package I never imagined!',
      rating: 5,
      batch: '2023',
      package: '₹35 LPA',
      location: 'Pune'
    },
    {
      name: 'Arjun Kumar',
      role: 'Full Stack Developer',
      company: 'Meta',
      image: 'AK',
      content: 'As a tier-2 college student, I thought top companies were out of reach. UniPlace proved me wrong. The platform connected me with opportunities I didn\'t know existed. Now I\'m at Meta!',
      rating: 5,
      batch: '2024',
      package: '₹42 LPA',
      location: 'Gurgaon'
    },
    {
      name: 'Kavya Reddy',
      role: 'ML Engineer',
      company: 'Apple',
      image: 'KR',
      content: 'The company verification feature gave me peace of mind. No spam, no fake listings. Every application I submitted was to a genuine opportunity. The platform is a game-changer for students.',
      rating: 5,
      batch: '2023',
      package: '₹38 LPA',
      location: 'Chennai'
    },
  ];

  // Company logos with industries
  const companies = [
    { name: 'Google', industry: 'Technology' },
    { name: 'Microsoft', industry: 'Technology' },
    { name: 'Amazon', industry: 'E-commerce' },
    { name: 'Meta', industry: 'Social Media' },
    { name: 'Apple', industry: 'Technology' },
    { name: 'Netflix', industry: 'Entertainment' },
    { name: 'Adobe', industry: 'Software' },
    { name: 'Salesforce', industry: 'Cloud' },
    { name: 'Goldman Sachs', industry: 'Finance' },
    { name: 'McKinsey', industry: 'Consulting' },
    { name: 'Deloitte', industry: 'Consulting' },
    { name: 'JP Morgan', industry: 'Finance' },
  ];

  // Enhanced How It Works Steps
  const steps = [
    { 
      step: '01', 
      title: 'Create Your Profile', 
      description: 'Sign up with your college email, add academic details, skills, and upload your resume. Our AI analyzes your profile for optimal matching.',
      icon: UserCheck,
      color: 'violet',
      duration: '5 mins'
    },
    { 
      step: '02', 
      title: 'Get Matched', 
      description: 'Our AI engine matches you with relevant opportunities based on your skills, CGPA, preferences, and career goals.',
      icon: Target,
      color: 'blue',
      duration: 'Instant'
    },
    { 
      step: '03', 
      title: 'Apply & Track', 
      description: 'Apply to jobs with one click. Track all applications in a unified dashboard with real-time status updates.',
      icon: Send,
      color: 'emerald',
      duration: 'Real-time'
    },
    { 
      step: '04', 
      title: 'Get Placed', 
      description: 'Prepare with our resources, ace your interviews, and land your dream job at top companies.',
      icon: Award,
      color: 'amber',
      duration: 'Success!'
    },
  ];

  // Platform benefits for different users
  const platformBenefits = {
    students: [
      'Access to 500+ verified job opportunities',
      'AI-powered job recommendations',
      'One-click application process',
      'Real-time application tracking',
      'Interview preparation resources',
      'Direct company connections'
    ],
    companies: [
      'Access to 5000+ verified students',
      'Smart candidate filtering',
      'Automated screening tools',
      'Campus engagement analytics',
      'Simplified hiring workflow',
      'Quality talent pipeline'
    ]
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <GraduationCap className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                UniPlace
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-violet-600 font-medium transition-colors">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-slate-600 hover:text-violet-600 font-medium transition-colors">How it Works</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-slate-600 hover:text-violet-600 font-medium transition-colors">Success Stories</button>
              <button onClick={() => scrollToSection('companies')} className="text-slate-600 hover:text-violet-600 font-medium transition-colors">Companies</button>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-slate-700 font-semibold hover:text-violet-600 transition-colors">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
            <button 
              className="md:hidden p-2 text-slate-700 hover:text-violet-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 px-6 space-y-4 animate-fadeIn">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left text-slate-600 hover:text-violet-600 font-medium py-2">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left text-slate-600 hover:text-violet-600 font-medium py-2">How it Works</button>
            <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left text-slate-600 hover:text-violet-600 font-medium py-2">Success Stories</button>
            <button onClick={() => scrollToSection('companies')} className="block w-full text-left text-slate-600 hover:text-violet-600 font-medium py-2">Companies</button>
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center text-slate-700 font-semibold py-2.5 border border-slate-200 rounded-xl">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-full px-4 py-2">
                <Sparkles size={16} className="text-violet-600" />
                <span className="text-sm font-medium text-violet-700">#1 Campus Placement Platform in India</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                Your Gateway to{' '}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  Dream Career
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                Connect with <strong className="text-slate-900">200+ top companies</strong>, access exclusive opportunities, and accelerate your career with India's most trusted placement platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-violet-500/30 transition-all hover:scale-105"
                >
                  Start Your Journey
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group inline-flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-violet-300 hover:bg-violet-50 transition-all">
                  <Play size={20} className="text-violet-600" />
                  Watch Demo
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['PS', 'RV', 'SP', 'AK'].map((initials, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-slate-600"><strong className="text-slate-900">5,000+</strong> Students</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-sm text-slate-600 ml-1"><strong className="text-slate-900">4.9/5</strong> Rating</span>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-emerald-500" />
                  <span className="text-sm text-slate-600"><strong className="text-slate-900">100%</strong> Verified</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Visual */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative">
                {/* Main Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Briefcase className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">Software Engineer</h3>
                        <p className="text-slate-400 text-sm">Google India • Bangalore</p>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      New
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-slate-300 text-sm">
                      <span className="flex items-center gap-1"><Globe size={14} /> Bangalore</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> Full-time</span>
                      <span className="flex items-center gap-1"><TrendingUp size={14} /> ₹32 LPA</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {['React', 'Node.js', 'Python', 'AWS', 'System Design'].map(skill => (
                        <span key={skill} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Applications</span>
                        <span className="text-white font-medium">234 applied</span>
                      </div>
                      <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-progressBar"></div>
                      </div>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02]">
                      Apply Now
                    </button>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 animate-float border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Application Sent!</p>
                      <p className="text-xs text-slate-500">Just now</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 animate-float animation-delay-2000 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Award className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">You're Shortlisted!</p>
                      <p className="text-xs text-slate-500">Microsoft India</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -right-8 bg-white rounded-2xl shadow-xl p-3 animate-float animation-delay-4000 border border-slate-100 hidden lg:block">
                  <div className="flex items-center gap-2">
                    <Bell className="text-violet-600" size={16} />
                    <span className="text-xs font-medium text-slate-700">3 new matches</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Companies Marquee */}
      <section id="companies" className="py-16 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <p className="text-center text-slate-500 font-medium">
            Trusted by students placed at <span className="text-slate-900 font-semibold">200+ top companies</span> worldwide
          </p>
        </div>
        <div className="relative">
          <div className="flex animate-marquee">
            {[...companies, ...companies].map((company, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 mx-8 px-6 py-3 bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all cursor-pointer group"
              >
                <p className="text-lg font-bold text-slate-400 group-hover:text-violet-600 transition-colors whitespace-nowrap">
                  {company.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-[length:60px_60px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Numbers That Speak Success
            </h2>
            <p className="text-violet-200 text-lg max-w-2xl mx-auto">
              Join thousands of students who've launched their careers through UniPlace
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: counters.students, suffix: '+', label: 'Students Registered', icon: Users, description: 'Active profiles' },
              { value: counters.companies, suffix: '+', label: 'Partner Companies', icon: Building2, description: 'Verified employers' },
              { value: counters.placements, suffix: '+', label: 'Successful Placements', icon: Briefcase, description: 'And counting' },
              { value: counters.packages, suffix: ' LPA', label: 'Highest Package', icon: TrendingUp, description: 'Top offer made' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-white/20 transition-all">
                  <stat.icon className="text-white" size={28} />
                </div>
                <div className="text-4xl md:text-5xl font-black text-white mb-1">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <p className="text-white font-semibold mb-1">{stat.label}</p>
                <p className="text-violet-200 text-sm">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Zap size={16} /> Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Get Placed
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              A comprehensive platform designed to maximize your placement success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="group relative bg-white rounded-3xl p-8 border border-slate-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-violet-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon size={28} />
                    </div>
                    <span className="text-xs font-bold text-violet-600 bg-violet-100 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      {feature.stats}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-500">
                        <CheckCircle size={14} className="text-emerald-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Enhanced */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Rocket size={16} /> Simple 4-Step Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From registration to placement - we've simplified every step
            </p>
          </div>

          {/* Process Flow Diagram */}
          <div className="relative max-w-4xl mx-auto mb-16">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-violet-200 via-blue-200 via-emerald-200 to-amber-200 -translate-y-1/2 z-0"></div>
            
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {steps.map((item, i) => (
                <div key={i} className="relative group">
                  <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-100 group-hover:border-violet-200">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${
                      item.color === 'violet' ? 'from-violet-500 to-violet-600' :
                      item.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      item.color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
                      'from-amber-500 to-amber-600'
                    } flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon size={28} />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.duration}</span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                  {/* Step Number */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Benefits */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl p-8 border border-violet-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">For Students</h3>
              </div>
              <ul className="space-y-3">
                {platformBenefits.students.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="inline-flex items-center gap-2 mt-6 text-violet-600 font-semibold hover:text-violet-700">
                Register as Student <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Building2 className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">For Companies</h3>
              </div>
              <ul className="space-y-3">
                {platformBenefits.companies.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="inline-flex items-center gap-2 mt-6 text-emerald-600 font-semibold hover:text-emerald-700">
                Register as Company <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Enhanced */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Heart size={16} /> Success Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Students Love UniPlace
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Real stories from real students who transformed their careers
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Main Testimonial Card */}
            <div className="bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-violet-100">
              <div className="flex items-center gap-1 mb-6">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={24} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              
              <blockquote className="text-xl md:text-2xl font-medium text-slate-800 mb-8 leading-relaxed">
                "{testimonials[activeTestimonial].content}"
              </blockquote>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {testimonials[activeTestimonial].image}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{testimonials[activeTestimonial].name}</p>
                    <p className="text-slate-600">{testimonials[activeTestimonial].role} at <span className="font-semibold text-violet-600">{testimonials[activeTestimonial].company}</span></p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {testimonials[activeTestimonial].package}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {testimonials[activeTestimonial].location}
                  </span>
                  <span className="bg-violet-100 text-violet-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    Batch {testimonials[activeTestimonial].batch}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              {testimonials.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i === activeTestimonial 
                      ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white scale-110 shadow-lg' 
                      : 'bg-slate-100 text-slate-600 hover:bg-violet-100'
                  }`}
                >
                  {t.image}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Award size={16} /> Why UniPlace
              </span>
              <h2 className="text-4xl font-black text-slate-900 mb-6">
                The Trusted Choice for{' '}
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Campus Placements
                </span>
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                We've built a platform that truly understands the needs of students and recruiters, delivering exceptional results consistently.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Lock, title: 'Secure & Private', desc: 'Your data is encrypted and never shared without consent' },
                  { icon: Layers, title: 'Easy Integration', desc: 'Seamless integration with college placement cells' },
                  { icon: Search, title: 'Smart Filters', desc: 'Find exactly what you need with powerful search filters' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="text-violet-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Platform Highlights</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '95%', label: 'Match Accuracy' },
                    { value: '24/7', label: 'Support Available' },
                    { value: '<5 min', label: 'Avg Response Time' },
                    { value: '100%', label: 'Free for Students' },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-violet-600">{item.value}</p>
                      <p className="text-sm text-slate-600">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6">
            <Sparkles size={16} className="text-violet-400" />
            <span className="text-sm font-medium text-violet-200">Join 5,000+ successful students</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Start Your{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Success Story?
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Your dream job is just a click away. Join India's most trusted placement platform today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-violet-500/30 transition-all hover:scale-105"
            >
              Create Free Account
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all border border-white/20"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold text-white">UniPlace</span>
              </Link>
              <p className="text-slate-400">
                India's #1 campus placement platform. Connecting talented students with their dream careers since 2020.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 hover:bg-violet-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 hover:bg-pink-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="mailto:contact@uniplace.in" className="w-10 h-10 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><GraduationCap size={14} /> For Students</Link></li>
                <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Building2 size={14} /> For Companies</Link></li>
                <li><button onClick={() => scrollToSection('features')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Sparkles size={14} /> Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Rocket size={14} /> How it Works</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('stats')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><TrendingUp size={14} /> Placement Stats</button></li>
                <li><button onClick={() => scrollToSection('testimonials')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Star size={14} /> Success Stories</button></li>
                <li><button onClick={() => scrollToSection('companies')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Building2 size={14} /> Partner Companies</button></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><FileText size={14} /> Career Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Get Started</h4>
              <p className="text-slate-400 text-sm mb-4">Ready to kickstart your career? Create your free account and join thousands of successful students.</p>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all text-sm"
              >
                Create Account
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© 2025 UniPlace. All rights reserved. Built with ❤️ for students.</p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes progressBar {
          0% { width: 0; }
          100% { width: 75%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blob { animation: blob 8s infinite ease-in-out; }
        .animate-float { animation: float 3s infinite ease-in-out; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease infinite; }
        .animate-progressBar { animation: progressBar 2s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};
