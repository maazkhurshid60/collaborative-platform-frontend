import React from 'react';
import { ClientType } from '../../types/clientType/ClientType';
import UserIcon from '../icons/user/User';
import AddIcon from '../icons/add/Add';
import { FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { _email } from 'zod/v4/core';

interface SearchResultsProps {
    results: ClientType[];
    onAddClient: (client: ClientType) => void;
    currentUserId: string;
    isVisible: boolean;
    isLoading?: boolean;
    emptyMessage?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
    results,
    onAddClient,
    currentUserId,
    isVisible,
    isLoading = false,
    emptyMessage = "No users found"

}) => {
    if (!isVisible) return null;
    console.log(results);

    return (
        <div className="absolute top-12 left-0 w-full z-[9999] bg-white border border-lightGreyColor rounded-lg shadow-lg overflow-hidden">
            {isLoading ? (
                <div className="p-4 text-center text-lightGreyColor">
                    <div className="animate-pulse">Searching...</div>
                </div>
            ) : results.length === 0 ? (
                <div className="p-4 text-center text-lightGreyColor text-sm">
                    {emptyMessage}
                </div>
            ) : (
                <div className="max-h-96 overflow-y-auto">
                    {results.map((user, index) => (
                        <SearchResultItem
                            key={user.id || index}
                            user={user}
                            onAddClient={onAddClient}
                            currentUserId={currentUserId}
                            isLast={index === results.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface SearchResultItemProps {
    user: ClientType;
    onAddClient: (client: ClientType) => void;
    currentUserId: string;
    isLast: boolean;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
    user,
    onAddClient,
    currentUserId,
    isLast
}) => {
    const isAlreadyAdded = user?.providerList?.some(
        provider => provider.providerId === currentUserId
    );
    console.log(user.user);

    return (

        <Link to={user?.user?.role === "client" ? `/clients/edit-client/${user.id}` : `/providers/${user.id}`} className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-colors duration-200 ${!isLast ? 'border-b border-gray-100' : ''}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                    {user?.user?.profileImage && user?.user?.profileImage !== "null" ? (
                        <img
                            src={user.user.profileImage}
                            alt={user.user?.fullName || "User"}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserIcon className="text-gray-400 text-lg" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                        {user?.user?.isApprove === "APPROVED" && (
                            <FaCheckCircle color='green' />
                        )}
                        <h4 className="text-sm font-semibold text-gray-900 capitalize truncate">
                            {user?.user?.fullName || 'Unknown User'}
                        </h4>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-600 truncate">
                            <span className="font-medium">Email:</span> {user?.user?.email || 'N/A'}
                        </p>
                        {user?.user?.licenseNo && (
                            <p className="text-xs text-gray-600 truncate">
                                <span className="font-medium">License:</span> {user.user.licenseNo}
                            </p>
                        )}
                        {user?.user?.role && (
                            <p className="text-xs text-gray-500 capitalize">
                                <span className="font-medium">Role:</span> {user.user.role}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0 ml-2">
                {isAlreadyAdded ? (
                    <span className="text-xs text-primaryColorDark font-medium px-2 py-1 bg-primaryColorLight rounded-md">
                        Added
                    </span>
                ) : user?.user?.role !== "provider" ? (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddClient(user);
                        }}
                        className="p-2 text-primaryColorDark hover:text-white hover:bg-primaryColorDark rounded-md transition-colors duration-200 group"
                        title="Add to your list"
                    >
                        <AddIcon />
                    </button>
                ) : null}
            </div>
        </Link>
    );
};

export default SearchResults;