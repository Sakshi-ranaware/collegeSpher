import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, AcademicCapIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { HiPhone, HiMail } from 'react-icons/hi';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  let navigation = [];
  
  if (user) {
    navigation = [
      { name: 'Dashboard', href: user.role === 'student' ? '/dashboard' : '/department', current: true },
      ...(user.role === 'student' ? [
        { name: 'Apply for LC', href: '/apply', current: false },
        { name: 'No Dues Status', href: '/no-dues', current: false },
        { name: 'Alumni Association', href: '/alumni', current: false },
      ] : []),
    ];

    if (user.role === 'admin') {
      navigation = [
        { name: 'Admin Dashboard', href: '/admin', current: true }
      ];
    }

    if (user.role === 'hod') {
      navigation = [
        { name: 'Dashboard', href: '/hod', current: true },
        { name: 'Alumni Applications', href: '/hod/alumni-applications', current: false }
      ];
    }
  } else {
    // Default navigation for non-logged in users
    navigation = [
      { name: 'LC Generate', href: '/apply', current: false }
    ];
  }

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
    {/* Top Bar */}
    <div className="bg-[#002147] text-white py-2 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <span className="font-bold">Follow Us</span>
          <div className="flex space-x-3">
             <a href="#" className="w-6 h-6 rounded-full bg-white text-[#002147] flex items-center justify-center hover:bg-gray-200 transition-colors"><FaFacebook size={12} /></a>
             <a href="#" className="w-6 h-6 rounded-full bg-white text-[#002147] flex items-center justify-center hover:bg-gray-200 transition-colors"><FaInstagram size={12} /></a>
             <a href="#" className="w-6 h-6 rounded-full bg-white text-[#002147] flex items-center justify-center hover:bg-gray-200 transition-colors"><FaYoutube size={12} /></a>
             <a href="#" className="w-6 h-6 rounded-full bg-white text-[#002147] flex items-center justify-center hover:bg-gray-200 transition-colors"><FaLinkedin size={12} /></a>
             <a href="#" className="w-6 h-6 rounded-full bg-white text-[#002147] flex items-center justify-center hover:bg-gray-200 transition-colors font-bold text-xs">X</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-4">
            <a href="mailto:nmiettalegaon@gmail.com" className="flex items-center hover:text-blue-300">
               <HiMail className="mr-1" /> nmiettalegaon@gmail.com
            </a>
            <a href="tel:+917423080910" className="flex items-center hover:text-blue-300">
               <HiPhone className="mr-1" /> +91 74230 80910
            </a>
          </div>
          <a href="#" className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700 transition-colors text-xs font-semibold uppercase tracking-wider">
            Campus Tour
          </a>
        </div>
      </div>
    </div>

    {/* Banner Image */}
    <div className="w-full">
        <img 
            src="https://res.cloudinary.com/dgxzpenl5/image/upload/v1767965951/PhotoshopExtension_Image_fjzfdh.png" 
            alt="College Banner" 
            className="w-full h-auto object-cover"
        />
    </div>

    <Disclosure as="nav" className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-lg sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center">
                {/* <Link to="/" className="flex flex-shrink-0 items-center space-x-2 group">
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                    <AcademicCapIcon className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white tracking-wide">CampuSphere</span>
                </Link> */}
                <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        'text-blue-100 hover:bg-white/10 hover:text-white',
                        'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                
                {/* Profile dropdown or Login/Register */}
                {user ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-blue-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800 transition-transform transform hover:scale-105">
                        <span className="sr-only">Open user menu</span>
                        {user.avatar ? (
                          <img className="h-9 w-9 rounded-full object-cover border-2 border-white/50" src={user.avatar} alt="" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold border-2 border-white/20">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white py-1 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
                        </div>
                        
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="#"
                                className={classNames(
                                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-700',
                                  'block px-4 py-2 text-sm flex items-center'
                                )}
                              >
                                <UserCircleIcon className="h-4 w-4 mr-2" /> Your Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={classNames(
                                  active ? 'bg-red-50 text-red-700' : 'text-gray-700',
                                  'block w-full px-4 py-2 text-left text-sm flex items-center'
                                )}
                              >
                                 <span className="w-4 mr-2">🚪</span> Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-4 items-center">
                    <Link
                      to="/login"
                      className={classNames(
                        isActive('/login') 
                          ? 'bg-blue-700 text-white shadow-inner' 
                          : 'text-gray-100 hover:text-white hover:bg-white/10',
                        'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border border-transparent'
                      )}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className={classNames(
                        isActive('/register')
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-blue-900 shadow-xl'
                          : 'hover:shadow-lg',
                        'bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md border border-white/20 transform hover:-translate-y-0.5 transition-all duration-200'
                      )}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-blue-200 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden bg-blue-900/95 backdrop-blur-sm border-t border-blue-800">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    'text-gray-300 hover:bg-blue-800 hover:text-white',
                    'block px-3 py-2 rounded-md text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-blue-800 pt-4 pb-3">
              {user ? (
                <>
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{user.name || 'User'}</div>
                      <div className="text-sm font-medium text-blue-300">{user.email || ''}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    <Disclosure.Button
                      as="button"
                      onClick={handleLogout}
                      className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-blue-200 hover:bg-blue-800 hover:text-white"
                    >
                      Sign out
                    </Disclosure.Button>
                  </div>
                </>
              ) : (
                <div className="space-y-1 px-2">
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block rounded-md px-3 py-2 text-base font-medium text-blue-200 hover:bg-blue-800 hover:text-white"
                  >
                    Login
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/register"
                    className="block rounded-md px-3 py-2 text-base font-medium text-blue-200 hover:bg-blue-800 hover:text-white"
                  >
                    Register
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
    </>
  );
}
