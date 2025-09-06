import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, Users, Zap, Shield, Target, Brain, Heart, Github, Award, Calendar, Clock, TrendingUp, MessageSquare, FileText, Video, BarChart3, Paintbrush, CheckCircle, ArrowRight, Star, Trophy } from 'lucide-react';

const PulseCollabLanding = () => {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({ hero: false });
  const [currentMetric, setCurrentMetric] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const metrics = [
    { value: "3x", label: "Faster Task Resolution", icon: <Zap /> },
    { value: "90%", label: "Fewer Status Emails", icon: <MessageSquare /> },
    { value: "50%", label: "Reduced Meeting Time", icon: <Clock /> },
    { value: "95%", label: "Team Satisfaction", icon: <Heart /> }
  ];

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Smart Project Hub",
      description: "AI-powered project management with predictive analytics and automated risk detection",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Unified Communication",
      description: "Seamless chat, video calls, and collaborative editing in one integrated platform",
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Live Collaboration",
      description: "Real-time whiteboarding, document editing, and ideation tools for remote teams",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Assistant",
      description: "Smart summaries, automated insights, and proactive recommendations powered by ML",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Real-time dashboards, performance heatmaps, and predictive project insights",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Wellness Tracking",
      description: "Monitor team health, prevent burnout, and maintain work-life balance automatically",
      color: "from-pink-500 to-rose-600"
    }
  ];

  const hackathonFeatures = [
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Built for Hackathons",
      description: "Rapid team formation, idea tracking, and sprint management"
    },
    {
      icon: <Github className="w-5 h-5" />,
      title: "Dev-First Integrations",
      description: "Native GitHub, GitLab, and CI/CD pipeline integrations"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Competition Ready",
      description: "Presentation mode, demo recording, and submission tracking"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Team Matching",
      description: "AI-powered skill matching and team formation algorithms"
    }
  ];

  const integrations = [
    { name: "GitHub", logo: "🐙" },
    { name: "Slack", logo: "💬" },
    { name: "Jira", logo: "🔷" },
    { name: "Figma", logo: "🎨" },
    { name: "Notion", logo: "📝" },
    { name: "Discord", logo: "🎮" },
    { name: "VS Code", logo: "💻" },
    { name: "Trello", logo: "📋" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const FloatingCard = ({ children, delay = 0 }) => (
    <div 
      className={`transform transition-all duration-1000 ${
        isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">PulseCollab</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#hackathon" className="text-slate-600 hover:text-blue-600 transition-colors">Hackathon</a>
              <a href="#integrations" className="text-slate-600 hover:text-blue-600 transition-colors">Integrations</a>
              <a href="/video-call" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center">
                <Video className="w-4 h-4 mr-1" />
                Video Call
              </a>
              <button className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all">
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-teal-100 rounded-full px-4 py-2 mb-6">
                <Award className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-700 font-medium">Built for Odoo Hackathon 2025</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                One Workspace.
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500"> Zero Chaos.</span>
                <br />Infinite Momentum.
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                PulseCollab unifies your projects, conversations, and meetings—while keeping your team healthy, inspired, and hackathon-ready.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a 
                  href="/video-call"
                  className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Try Video Call Demo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </a>
                <button 
                  className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-all"
                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch 2-Minute Demo
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  Free forever for small teams
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  No credit card required
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-teal-400 rounded-3xl transform rotate-6 opacity-20"></div>
              
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
                <FloatingCard delay={200}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-800">Team Dashboard</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-700">Hackathon Project</span>
                        <span className="text-green-600 text-sm font-medium">85% Complete</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full w-4/5"></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-xs text-slate-600">Active Tasks</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-teal-600">5</div>
                        <div className="text-xs text-slate-600">Team Members</div>
                      </div>
                    </div>
                  </div>
                </FloatingCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Too many tabs? Missed deadlines? Burnout creeping in?
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            PulseCollab streamlines work, surfaces risk early, and helps leaders prevent overtime fatigue—so your team delivers without burning out.
          </p>
        </div>
      </section>

      {/* Live Metrics */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {metrics.map((metric, idx) => (
              <div 
                key={idx}
                className={`text-center p-6 rounded-2xl transition-all duration-500 ${
                  currentMetric === idx 
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white transform scale-105 shadow-xl' 
                    : 'bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex justify-center mb-3">
                  {React.cloneElement(metric.icon, { 
                    className: `w-8 h-8 ${currentMetric === idx ? 'text-white' : 'text-blue-600'}` 
                  })}
                </div>
                <div className="text-3xl font-bold mb-2">{metric.value}</div>
                <div className="text-sm font-medium">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hackathon Features */}
      <section id="hackathon" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-purple-100 rounded-full px-4 py-2 mb-4">
              <Trophy className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm text-purple-700 font-medium">Hackathon Special</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Designed for Competitive Innovation
            </h2>
            <p className="text-xl text-slate-600">
              From ideation to submission, we've got your hackathon journey covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {hackathonFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  {React.cloneElement(feature.icon, { className: 'text-white' })}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything Your Team Needs, Nothing It Doesn't
            </h2>
            <p className="text-xl text-slate-600">
              Powerful features that scale with your ambitions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="group bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-2xl hover:border-transparent transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(feature.icon, { className: 'text-white' })}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Bring Your Existing Tools—PulseCollab Plays Nice
            </h2>
            <p className="text-slate-600">
              Seamless integrations with the tools you already love
            </p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-8">
            {integrations.map((integration, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:transform hover:scale-110 text-center group cursor-pointer"
              >
                <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">
                  {integration.logo}
                </div>
                <div className="text-sm text-slate-600 font-medium">{integration.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech & Trust */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">Built for Scale. Secured by Design.</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl">
              <Shield className="w-8 h-8 text-teal-400 mb-4 mx-auto" />
              <h3 className="font-semibold mb-3">Enterprise Security</h3>
              <p className="text-slate-300 text-sm">Role-based access control, end-to-end encryption, and SOC 2 compliance</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-teal-400 mb-4 mx-auto" />
              <h3 className="font-semibold mb-3">Performance First</h3>
              <p className="text-slate-300 text-sm">Real-time sync, PostgreSQL search, and multi-tenant architecture</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
            ))}
          </div>
          <blockquote className="text-2xl font-medium text-slate-900 mb-6">
            "PulseCollab cut our weekly meetings in half and doubled our productivity. It's like having a project manager that never sleeps."
          </blockquote>
          <div className="text-slate-600">
            <p className="font-semibold">Sarah Chen, Lead Developer</p>
            <p>Winning Hackathon Team • TechCrunch Disrupt</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Free for Small Teams. Flexible Plans as You Grow.
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            Start building amazing things today, scale when you're ready
          </p>
          
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Hackathon Special</h3>
            <p className="text-lg mb-6">Free premium features for all hackathon participants</p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
              Claim Your Spot
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Stop Juggling Apps. Start Pulsing with Your Team.
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Join thousands of teams who've transformed their workflow with PulseCollab
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-10 py-4 rounded-xl font-semibold text-lg flex items-center justify-center hover:shadow-2xl transform hover:scale-105 transition-all">
              Sign Up Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="border-2 border-white/30 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">PulseCollab</span>
              </div>
              <p className="text-sm">Empowering teams to collaborate without chaos.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2025 PulseCollab. Built with ❤️ for the Odoo Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PulseCollabLanding;