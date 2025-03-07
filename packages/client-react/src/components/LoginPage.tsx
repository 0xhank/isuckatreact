import React from "react";
import { LoginButton } from "./LoginButton";

const LoginPage: React.FC = () => {
    return (
        <div className="flex min-h-[80vh] w-full">
            {/* Left side with illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 flex-col justify-center items-center p-12 text-white">
                <div className="max-w-md">
                    <svg
                        className="w-16 h-16 mb-8"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M20 4L3 11L10 14M20 4L13 21L10 14M20 4L10 14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    <h1 className="text-4xl font-bold mb-6">
                        AI-Powered App Creation
                    </h1>
                    <p className="text-xl mb-8">
                        Because learning to code is for midwits. Let Claude do
                        the work while you take the credit.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center">
                            <div className="rounded-full bg-blue-500 p-2 mr-4">
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        d="M5 13L9 17L19 7"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <p className="text-lg">
                                Instant app generation{" "}
                                <span className="text-blue-200 text-sm italic">
                                    (results may vary)
                                </span>
                            </p>
                        </div>

                        <div className="flex items-center">
                            <div className="rounded-full bg-blue-500 p-2 mr-4">
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        d="M5 13L9 17L19 7"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <p className="text-lg">
                                Integration with your favorite apps{" "}
                                <span className="text-blue-200 text-sm italic">
                                    (that weren't too complicated for us)
                                </span>
                            </p>
                        </div>

                        <div className="flex items-center">
                            <div className="rounded-full bg-blue-500 p-2 mr-4">
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        d="M5 13L9 17L19 7"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <p className="text-lg">
                                Feel like a developer without all that pesky
                                learning
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side with login form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 bg-white">
                <div className="w-full max-w-md">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome to ISuckatReact.com
                        </h2>
                        <p className="text-gray-600">
                            Because React made us all feel inadequate anyway
                        </p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-8 mb-8">
                        <div className="mb-8 text-center">
                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                Sign in to your account
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Access powerful AI tools and pretend you built
                                them yourself
                            </p>
                        </div>

                        <div className="space-y-4">
                            <LoginButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
