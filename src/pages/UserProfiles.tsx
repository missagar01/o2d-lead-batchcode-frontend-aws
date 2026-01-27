import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";


export default function UserProfiles() {
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
          Profile
        </p>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          Account overview
        </h1>
        <p className="text-sm text-gray-500">
          Review your personal details and update the information as needed.
        </p>
      </header>
      <div className="space-y-6">
        <UserMetaCard />
        <UserInfoCard />
        <UserAddressCard />
      </div>
    </div>
  );
}
