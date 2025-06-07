
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Shield, Eye, Cookie, Scale, Mail, Phone, MapPin } from 'lucide-react';

const LegalPoliciesPage = () => {
  const [expandedSections, setExpandedSections] = useState({
    terms: true,
    privacy: false,
    cookies: false
  });

  const [scrollPosition, setScrollPosition] = useState(0);
  const headerRef = useRef(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const lastUpdated = "June 7, 2025";

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header ref={headerRef} className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary, #FF7A59)' }}>
                <Scale size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">TailTrade Legal Center</h1>
                <p className="text-sm text-gray-600">Your rights and responsibilities</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-full bg-orange-100">
                <Shield size={24} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to TailTrade's Legal Center</h2>
                <p className="text-gray-600 leading-relaxed">
                  TailTrade is South Africa's premier customer-to-customer platform for buying and selling pets and pet-related items. 
                  These policies outline how we protect your rights, handle your data, and ensure a safe trading environment for all users.
                </p>
              </div>
            </div>
          </div>

          {/* Terms of Service */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div 
              className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('terms')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Scale size={24} className="text-orange-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Terms of Service</h3>
                </div>
                {expandedSections.terms ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {expandedSections.terms && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    By accessing and using TailTrade, you accept and agree to be bound by the terms and provision of this agreement. 
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">2. Platform Description</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    TailTrade is a customer-to-customer (C2C) platform that facilitates the buying and selling of pets and pet-related 
                    items within South Africa. We provide the technology and tools to connect buyers and sellers but are not a party 
                    to any transactions between users.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">3. User Responsibilities</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Account Security</h5>
                      <p className="text-gray-700 text-sm">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Accurate Information</h5>
                      <p className="text-gray-700 text-sm">All information provided in listings must be accurate, current, and complete. Misrepresentation of pets or products is strictly prohibited.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Legal Compliance</h5>
                      <p className="text-gray-700 text-sm">Users must comply with all applicable South African laws regarding pet ownership, breeding, and sale of animals and pet products.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">4. Prohibited Activities</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Listing illegal or banned animal species</li>
                    <li>Misrepresenting animal health, age, or breeding status</li>
                    <li>Engaging in fraudulent transactions or payment schemes</li>
                    <li>Harassment or abusive behavior toward other users</li>
                    <li>Posting inappropriate or offensive content</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">5. Transaction Terms</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    TailTrade facilitates connections between buyers and sellers but does not guarantee the completion of transactions. 
                    All sales are final between the parties involved. We recommend meeting in safe, public locations and inspecting 
                    pets/products before finalizing any purchase.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">6. Limitation of Liability</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    TailTrade shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages 
                    resulting from your use of the platform or any transactions conducted through it.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Policy */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div 
              className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('privacy')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye size={24} className="text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Privacy Policy</h3>
                </div>
                {expandedSections.privacy ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {expandedSections.privacy && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">1. Information We Collect</h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Account Information</h5>
                      <p className="text-gray-700 text-sm">Name, email address, phone number, and location details provided during registration.</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Listing Data</h5>
                      <p className="text-gray-700 text-sm">Information about pets and products you list, including descriptions, photos, and pricing.</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Communication Records</h5>
                      <p className="text-gray-700 text-sm">Messages exchanged between users through our platform's messaging system.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">2. How We Use Your Information</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Facilitate communication between buyers and sellers</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Improve platform functionality and user experience</li>
                    <li>Ensure compliance with our terms of service</li>
                    <li>Send important updates about your account or listings</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">3. Information Sharing</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy. 
                    Information may be shared with other users as necessary to facilitate transactions (e.g., contact details for arranged meetings).
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">4. Data Security</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction 
                    of your personal information. However, no method of transmission over the internet is 100% secure.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">5. Your Rights</h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm">
                      You have the right to access, update, or delete your personal information. You may also opt out of 
                      certain communications. Contact us to exercise these rights.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">6. Data Retention</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We retain your information for as long as your account is active or as needed to provide services. 
                    Inactive accounts may be deleted after 2 years of inactivity.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cookie Policy */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div 
              className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('cookies')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Cookie size={24} className="text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Cookie Policy</h3>
                </div>
                {expandedSections.cookies ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {expandedSections.cookies && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">What Are Cookies?</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Cookies are small text files that are stored on your device when you visit our website. They help us 
                    provide you with a better experience by remembering your preferences and improving site functionality.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Types of Cookies We Use</h4>
                  <div className="space-y-3">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Essential Cookies</h5>
                      <p className="text-gray-700 text-sm">Required for the website to function properly, including user authentication and security features.</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Functional Cookies</h5>
                      <p className="text-gray-700 text-sm">Remember your preferences and settings to enhance your user experience.</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Analytics Cookies</h5>
                      <p className="text-gray-700 text-sm">Help us understand how users interact with our platform to improve our services.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Managing Cookies</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You can control and manage cookies through your browser settings. However, disabling certain cookies 
                    may affect the functionality of our platform. Most browsers allow you to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>View and delete cookies</li>
                    <li>Block cookies from specific sites</li>
                    <li>Block all cookies</li>
                    <li>Clear cookies when you close your browser</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Third-Party Cookies</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We may use third-party services that set their own cookies. These are primarily for analytics and 
                    advertising purposes. We do not control these cookies, and they are subject to the respective 
                    third party's privacy policies.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about these policies or need to exercise your rights, please contact us:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={20} className="text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email</p>
                    <p className="text-sm text-gray-600">legal@tailtrade.co.za</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone size={20} className="text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Phone</p>
                    <p className="text-sm text-gray-600">+27 11 123 4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin size={20} className="text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Address</p>
                    <p className="text-sm text-gray-600">Johannesburg, South Africa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPoliciesPage;