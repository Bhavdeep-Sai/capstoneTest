import React from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Users, GraduationCap, ArrowLeft } from 'lucide-react';

const RoleSelection = () => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'school',
            title: 'School Admin',
            description: 'Manage your entire institution with comprehensive administrative tools',
            icon: <School className="w-12 h-12 text-orange-500" />,
            features: ['Student Management', 'Teacher Management', 'Class Management', 'Reports & Analytics'],
            color: 'from-orange-500 to-red-500'
        },
        {
            id: 'teacher',
            title: 'Teacher',
            description: 'Access your teaching dashboard to manage classes and students',
            icon: <Users className="w-12 h-12 text-blue-500" />,
            features: ['Class Management', 'Attendance Tracking', 'Exam Scheduling', 'Student Progress'],
            color: 'from-blue-500 to-indigo-500'
        },
        {
            id: 'student',
            title: 'Student',
            description: 'View your academic progress, schedules, and important notices',
            icon: <GraduationCap className="w-12 h-12 text-green-500" />,
            features: ['View Schedules', 'Check Attendance', 'Exam Schedule', 'Notices'],
            color: 'from-green-500 to-teal-500'
        }
    ];

    const handleRoleSelect = (roleId) => {
        navigate(`/login/${roleId}`);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Header */}
            <header className="bg-gray-800 shadow-md">
                <nav className="container px-5 py-4 flex gap-10 items-center">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="cursor-pointer flex items-center text-gray-300 hover:text-orange-500 transition-colors mr-4"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Home
                        </button>
                    </div>
                    <div className=" text-2xl md:text-3xl font-bold text-white">Beacon <span className='text-orange-500'>Port</span></div>
                </nav>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                        Choose Your Role
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Select your role to access the appropriate dashboard and features tailored for your needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="group relative bg-gray-800 rounded-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-transparent overflow-hidden"
                        >
                            {/* Gradient overlay on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="p-4 bg-gray-700 rounded-full group-hover:bg-gray-600 transition-colors duration-300">
                                        {role.icon}
                                    </div>
                                </div>

                                {/* Title and Description */}
                                <h3 className="text-2xl font-bold text-center mb-4 group-hover:text-orange-400 transition-colors duration-300">
                                    {role.title}
                                </h3>
                                <p className="text-gray-400 text-center mb-6 leading-relaxed">
                                    {role.description}
                                </p>

                                {/* Features List */}
                                <ul className="space-y-3 mb-8">
                                    {role.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm text-gray-300">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {/* Action Button */}
                                <div onClick={() => handleRoleSelect(role.id)} className="cursor-pointer text-center">
                                    <button className="cursor-pointer w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl">
                                        Login as {role.title}
                                    </button>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-500"></div>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="text-center mt-16">
                    <p className="text-gray-500 mb-4">
                        Own a school but don't have an account yet? Join us
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        className="cursor-pointer text-orange-500 hover:text-orange-400 font-medium transition-colors duration-300 underline underline-offset-4 decoration-2 hover:decoration-orange-400"
                    >
                        Create a new account
                    </button>
                </div>
            </div>

            {/* Background Pattern */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default RoleSelection;