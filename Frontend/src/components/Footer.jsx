import { motion } from "framer-motion";

// Custom icon components to avoid lucide-react export issues
const Github = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-1.02-2.61c3.3-.37 6.8-1.63 6.8-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.5 6.61 6.8 7A3.36 3.36 0 0 0 9 18.13V21" />
  </svg>
);

const Twitter = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
  </svg>
);

const Linkedin = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Mail = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
  </svg>
);

const ExternalLink = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const Heart = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const Code2 = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub", color: "hover:text-neon-blue" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-neon-purple" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-neon-green" },
    { icon: Mail, href: "mailto:contact@codesync.com", label: "Email", color: "hover:text-neon-blue" },
  ];

  const quickLinks = [
    { label: "Documentation", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Blog", href: "#" },
  ];

  const footerLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ];

  return (
    <footer className="w-full bg-gradient-to-b from-cyber-900 via-cyber-900/95 to-cyber-950 border-t border-cyber-700 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-gradient-to-br from-neon-purple to-neon-blue rounded-lg">
                <Code2 size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                CodeSync
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Real-time collaborative code editor for seamless teamwork and instant code execution.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-full bg-cyber-800 border border-cyber-700 text-gray-400 transition-all hover:border-neon-purple/50 ${social.color}`}
                    title={social.label}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-neon-purple"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-neon-blue transition-colors flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-neon-blue"></span>
              Features
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-gray-400">
                  ✨ Real-time Collaboration
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400">
                  ⚡ Instant Code Execution
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400">
                  💬 Live Chat & Typing
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400">
                  🔐 Secure Rooms
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col"
          >
            <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-neon-green"></span>
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-neon-green transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-neon-green transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-neon-green transition-colors">
                  Report Bug
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-neon-green transition-colors">
                  Feedback
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-cyber-700 to-transparent mb-8"></div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-xs text-gray-500">
            © {currentYear} CodeSync. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {footerLinks.map((link, idx) => (
              <div key={link.label} className="flex items-center gap-4">
                <a href={link.href} className="hover:text-gray-300 transition-colors">
                  {link.label}
                </a>
                {idx < footerLinks.length - 1 && <span className="text-cyber-700">•</span>}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 flex items-center gap-1">
            Built with <Heart size={12} className="text-neon-purple animate-pulse" /> by the CodeSync Team
          </p>
        </motion.div>
      </div>

      {/* Gradient Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl opacity-20"></div>
      </div>
    </footer>
  );
}

export default Footer;
