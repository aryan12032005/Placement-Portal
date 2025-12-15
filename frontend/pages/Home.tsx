import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Building2, Users, Briefcase, ArrowRight, CheckCircle, 
  Star, TrendingUp, Shield, Zap, Award, Target, ChevronRight, Play,
  Sparkles, Globe, Clock, BookOpen, Rocket, Heart, Menu, X
} from 'lucide-react';

export const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counters, setCounters] = useState({ students: 0, companies: 0, placements: 0, packages: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate counters
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

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Target,
      title: 'Smart Job Matching',
      description: 'AI-powered algorithms match students with the perfect opportunities based on skills, CGPA, and preferences.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Verified Companies',
      description: 'Every company is thoroughly verified to ensure authentic opportunities and safe recruitment process.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Instant notifications for application status, new opportunities, and important placement updates.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics for tracking placement statistics, trends, and performance metrics.',
      gradient: 'from-orange-500 to-amber-500',
    },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer at Google',
      image: 'PS',
      content: 'UniPlace made my placement journey incredibly smooth. I received 5 interview calls within a week of registering. The platform is intuitive and the job matching is spot-on!',
      rating: 5,
      batch: '2024',
    },
    {
      name: 'Rahul Verma',
      role: 'Product Manager at Microsoft',
      image: 'RV',
      content: 'The best placement platform I have used. The real-time notifications kept me updated, and the application tracking made it easy to manage multiple opportunities.',
      rating: 5,
      batch: '2024',
    },
    {
      name: 'Sneha Patel',
      role: 'Data Scientist at Amazon',
      image: 'SP',
      content: 'From resume building to final placement, UniPlace guided me through every step. Landed my dream job with a 32 LPA package. Highly recommended!',
      rating: 5,
      batch: '2023',
    },
  ];

  const companies = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 
    'Adobe', 'Salesforce', 'Oracle', 'IBM', 'Infosys', 'TCS'
  ];

  const steps = [
    { step: '01', title: 'Create Account', description: 'Sign up with your college email and complete your profile with academic details.' },
    { step: '02', title: 'Build Profile', description: 'Add your skills, projects, achievements, and upload your resume.' },
    { step: '03', title: 'Explore Jobs', description: 'Browse through verified job opportunities matching your profile.' },
    { step: '04', title: 'Get Placed', description: 'Apply, interview, and land your dream job with top companies.' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                UniPlace
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">How it Works</a>
              <a href="#testimonials" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Testimonials</a>
              <a href="#stats" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Stats</a>
              <a href="#companies" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Companies</a>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-slate-700 font-semibold hover:text-violet-600 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
            {/* Mobile Menu Button */}
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
          <div className="md:hidden bg-white border-t border-slate-100 py-4 px-6 space-y-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-slate-600 hover:text-violet-600 font-medium py-2">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-slate-600 hover:text-violet-600 font-medium py-2">How it Works</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-slate-600 hover:text-violet-600 font-medium py-2">Testimonials</a>
            <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="block text-slate-600 hover:text-violet-600 font-medium py-2">Stats</a>
            <a href="#companies" onClick={() => setMobileMenuOpen(false)} className="block text-slate-600 hover:text-violet-600 font-medium py-2">Companies</a>
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-slate-700 font-semibold py-2.5 border border-slate-200 rounded-xl hover:border-violet-300"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-2">
                <Sparkles size={16} className="text-violet-600" />
                <span className="text-sm font-medium text-violet-700">
                  #1 Placement Platform for Universities
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                Your Gateway to{' '}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Dream Career
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                Connect with 200+ top companies, access exclusive job opportunities, and accelerate your career journey with India's most trusted placement platform.
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
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['A', 'B', 'C', 'D'].map((letter, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                        {letter}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-slate-600"><strong className="text-slate-900">5,000+</strong> Students Placed</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-sm text-slate-600 ml-1"><strong className="text-slate-900">4.9</strong> Rating</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image/Card */}
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
                        <p className="text-slate-400 text-sm">Google India</p>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
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
                      {['React', 'Node.js', 'Python', 'AWS'].map(skill => (
                        <span key={skill} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                      Apply Now
                    </button>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Application Sent!</p>
                      <p className="text-sm text-slate-500">Just now</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 animate-float animation-delay-2000">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Award className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">You're Shortlisted!</p>
                      <p className="text-sm text-slate-500">Microsoft</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos */}
      <section id="companies" className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-slate-500 font-medium mb-8">
            Trusted by students placed at top companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {companies.map((company, i) => (
              <div 
                key={company} 
                className="text-2xl font-bold text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Numbers That Speak Success
            </h2>
            <p className="text-violet-200 text-lg max-w-2xl mx-auto">
              Our track record speaks for itself. Join thousands of students who've launched their careers through UniPlace.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: counters.students, suffix: '+', label: 'Students Registered', icon: Users },
              { value: counters.companies, suffix: '+', label: 'Partner Companies', icon: Building2 },
              { value: counters.placements, suffix: '+', label: 'Successful Placements', icon: Briefcase },
              { value: counters.packages, suffix: ' LPA', label: 'Highest Package', icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="text-white" size={28} />
                </div>
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <p className="text-violet-200 font-medium">{stat.label}</p>
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
              From smart job matching to real-time updates, we've built the ultimate platform for your placement success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="group relative bg-white rounded-3xl p-8 border border-slate-100 hover:border-transparent hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Rocket size={16} /> Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get placed in 4 simple steps. We've streamlined the entire process to make your journey smooth.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-violet-300 to-transparent -translate-x-1/2 z-0"></div>
                )}
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all group">
                  <div className="text-6xl font-black bg-gradient-to-r from-violet-200 to-indigo-200 bg-clip-text text-transparent mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Heart size={16} /> Student Love
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Hear from students who transformed their careers with UniPlace.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl p-8 md:p-12">
              <div className="flex items-center gap-1 mb-6">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={24} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              
              <blockquote className="text-2xl md:text-3xl font-medium text-slate-800 mb-8 leading-relaxed">
                "{testimonials[activeTestimonial].content}"
              </blockquote>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[activeTestimonial].image}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{testimonials[activeTestimonial].name}</p>
                    <p className="text-slate-600">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
                <span className="text-slate-400 font-medium">Batch of {testimonials[activeTestimonial].batch}</span>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === activeTestimonial ? 'bg-violet-600 w-8' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Start Your{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Success Story?
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join 5,000+ students who have already kickstarted their careers. Your dream job is just a click away.
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
                Connecting talented students with their dream careers since 2020.
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
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Users size={14} /> For Students</Link></li>
                <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Building2 size={14} /> For Companies</Link></li>
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Sparkles size={14} /> Features</a></li>
                <li><a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Rocket size={14} /> How it Works</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#stats" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><TrendingUp size={14} /> Statistics</a></li>
                <li><a href="#testimonials" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Star size={14} /> Success Stories</a></li>
                <li><a href="#companies" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Building2 size={14} /> Partner Companies</a></li>
                <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"><Shield size={14} /> Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Get Started</h4>
              <p className="text-slate-400 text-sm mb-4">Ready to kickstart your career? Create your account today and join thousands of successful students.</p>
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

      {/* Custom Styles for Animations */}
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
        
        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        
        .animate-float {
          animation: float 3s infinite ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};
