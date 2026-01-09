import React from 'react';
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin, FaInstagram, FaChevronUp } from 'react-icons/fa';
import { HiLocationMarker, HiPhone, HiMail } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className="bg-[#002147] text-white pt-12 pb-4">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Column 1: NMIET */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                           <span className="mr-2">📖</span> NMIET
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <HiLocationMarker className="mt-1 mr-2 text-xl shrink-0" />
                                <p className="text-sm">
                                    Samarth Vidya Sankul, Vishnupuri,
                                    Talegaon Dabhade, Pune – 410507
                                </p>
                            </div>
                            <div className="flex items-center">
                                <HiPhone className="mr-2 text-xl" />
                                <p className="text-sm">02114 – 231666</p>
                            </div>
                             <div className="flex items-center">
                                <HiPhone className="mr-2 text-xl" />
                                <p className="text-sm">+91 74230 80910</p>
                            </div>
                            <div className="flex items-center">
                                <HiMail className="mr-2 text-xl" />
                                <p className="text-sm">nmiettalegaon@gmail.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                         <h3 className="text-xl font-bold mb-4 flex items-center">
                           <span className="mr-2">📖</span> Quick Links
                        </h3>
                        <ul className="space-y-2 text-sm">
                             <li>
                                <Link to="/about" className="flex items-center hover:text-blue-300">
                                    <span className="mr-2">➔</span> About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="flex items-center hover:text-blue-300">
                                    <span className="mr-2">➔</span> FAQ's
                                </Link>
                            </li>
                             <li>
                                <Link to="/testimonials" className="flex items-center hover:text-blue-300">
                                    <span className="mr-2">➔</span> Testimonials
                                </Link>
                            </li>
                             <li>
                                <Link to="/terms" className="flex items-center hover:text-blue-300">
                                    <span className="mr-2">➔</span> Terms Of Service
                                </Link>
                            </li>
                             <li>
                                <Link to="/policy" className="flex items-center hover:text-blue-300">
                                    <span className="mr-2">➔</span> policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Quick Links (Second Column) */}
                    <div>
                         <h3 className="text-xl font-bold mb-4 flex items-center">
                           <span className="mr-2">📖</span> Quick Links
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/academics" className="flex items-center hover:text-blue-300">
                                    <span className="mr-2">➔</span> Academics
                                </Link>
                            </li>
                            <li>
                                <Link to="/naac" className="flex items-center hover:text-blue-300">
                                    <span className="mr-2">➔</span> NAAC
                                </Link>
                            </li>
                             <li>
                                <Link to="/nisp" className="flex items-center hover:text-blue-300">
                                    <span className="mr-2">➔</span> NISP
                                </Link>
                            </li>
                             <li>
                                <Link to="/important-links" className="flex items-center hover:text-blue-300">
                                    <span className="mr-2">➔</span> Important Links
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Location */}
                    <div>
                         <h3 className="text-xl font-bold mb-4 flex items-center">
                           <span className="mr-2">📖</span> Location
                        </h3>
                        <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                             <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3778.61868478479!2d73.66311631489587!3d18.72591698728956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b1cf56000001%3A0x6b00000000000000!2sNMIET!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="NMIET Location"
                            ></iframe>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 pt-4 flex flex-col md:flex-row justify-between items-center text-sm">
                    <div className="text-gray-300 mb-4 md:mb-0">
                        © Copyright 2025 | NMIET Institute | All Rights Reserved | SEO and Web Design by Sakshi Ranaware
                    </div>
                    <div className="flex items-center space-x-6">
                        <span className="font-bold">Follow Us</span>
                        <div className="flex space-x-3">
                            <a href="#" className="w-8 h-8 rounded-full bg-white text-[#002147] flex items-center justify-center hover:bg-gray-200 transition-colors"><FaFacebook /></a>
                             <a href="#" className="w-8 h-8 rounded-full bg-white text-[#002147] flex items-center justify-center hover:bg-gray-200 transition-colors"><FaInstagram /></a>
                             <a href="#" className="w-8 h-8 rounded-full bg-white text-[#002147] flex items-center justify-center hover:bg-gray-200 transition-colors"><FaYoutube /></a>
                             <a href="#" className="w-8 h-8 rounded-full bg-white text-[#002147] flex items-center justify-center hover:bg-gray-200 transition-colors"><FaLinkedin /></a>
                             <a href="#" className="w-8 h-8 rounded-full bg-white text-[#002147] flex items-center justify-center hover:bg-gray-200 transition-colors">X</a>
                        </div>
                         <button 
                            onClick={scrollToTop} 
                            className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                            <FaChevronUp />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
