import { useAuth0 } from "@auth0/auth0-react";

export const LoginButton = () => {
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

    if (isAuthenticated) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   
                    <span className="text-sm font-medium text-gray-700">
                        {user?.name}
                    </span>
                </div>
                <button
                    onClick={() => logout()}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    Log Out
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
            <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"
                    fill="currentColor"
                />
            </svg>
            Sign In
        </button>
    );
};
