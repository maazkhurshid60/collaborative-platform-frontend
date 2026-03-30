import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../public/assets/logo.png';
import { Search } from 'lucide-react';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-[Poppins] text-[#111827]">
            {/* Top Logo */}
            <div className="mb-24">
                <img
                    src={logo}
                    alt="Kolabme"
                    className="h-30 w-auto"
                />
            </div>

            <div className="max-w-md w-full flex flex-col items-center space-y-8 text-center">
                {/* Minimalist 404 Visual */}
                <div className="relative">
                    <span className="text-[120px] font-extrabold leading-none text-gray-900 tracking-tighter z-10 select-none font-[Montserrat]">404</span>
                    <div className="absolute -top-4  -right-4 w-12 h-12 bg-[#2C9993]/10 rounded-full flex items-center justify-center">
                        <Search className="text-[#2C9993] w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
                    <p className="text-gray-500 text-lg">
                        Sorry, we couldn’t find the page you’re looking for. It might have been moved or doesn't exist.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 w-full justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto bg-[#2C9993] text-white px-8 py-3 rounded-lg font-semibold transition-all hover:bg-[#2C9993]/90 active:scale-95 cursor-pointer shadow-sm"
                    >
                        Go back home
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto text-gray-600 hover:text-gray-900 px-8 py-3 font-semibold transition-colors cursor-pointer"
                    >
                        Go back
                    </button>
                </div>

                {/* Helpful Links/Footer */}
                <div className="pt-16 border-t border-gray-100 w-full">
                    <p className="text-gray-400 text-sm">
                        Contact support if you believe this is a mistake.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
