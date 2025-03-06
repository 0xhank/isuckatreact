import { useAuth0 } from "@auth0/auth0-react";

export const LoginButton = () => {
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

    if (isAuthenticated) {
        return (
            <div className="flex items-center gap-4">
                <span>{user?.name}</span>
                <button
                    onClick={() => logout()}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Log Out
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
        >
            Log In
        </button>
    );
};
