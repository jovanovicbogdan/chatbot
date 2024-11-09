import { Link } from 'react-router-dom';
import { getAuthUser, User } from '../../services/user-service';
import { useEffect, useState } from 'react';
import ThemeSwitcher from '../ThemeSwitcher';
import { toast } from 'react-toastify';
import { ExternalLink } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<User>({
    user_id: '',
    email: '',
    first_name: '',
    last_name: '',
  });

  useEffect(() => {
    async function fetchAuthUser() {
      try {
        const user = await getAuthUser();
        setUser(() => user);
      } catch (error) {
        toast.error('An error occurred while trying to get user.', {
          theme: localStorage.selectedTheme,
        });
      }
    }

    // fixed right-6 top-4
    fetchAuthUser();
  }, []);

  return (
    <div className="fixed right-6 top-4">
      <AvatarDropdown user={user} />
    </div>
  );
}

type AvatarDropdownProps = {
  user: User;
};

function AvatarDropdown({ user }: AvatarDropdownProps) {
  const [openAvatarDropdown, setOpenAvatarDropdown] = useState<boolean>(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpenAvatarDropdown(() => !openAvatarDropdown)}
        className="relative z-[999] flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
      >
        <img
          src="/user.png"
          alt="User avatar"
          className="w-8 h-8 rounded-full"
        />
      </button>
      {openAvatarDropdown && (
        <button
          onClick={() => setOpenAvatarDropdown(() => false)}
          className="fixed z-[998] inset-0 h-full w-full bg-dark-background opacity-50 cursor-default"
          tabIndex={-1}
        ></button>
      )}
      <div
        className={`${openAvatarDropdown ? '' : 'hidden'} absolute z-[999] right-0 mt-2 py-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600`}
      >
        <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
          <div>
            {user.first_name} {user.last_name}
          </div>
          <div className="font-medium truncate">{user.email}</div>
        </div>
        <div className="py-2 text-sm text-gray-700 dark:text-gray-200">
          <Link
            to="/"
            className="flex items-center space-x-1 block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={() => setOpenAvatarDropdown(() => false)}
          >
            Home
          </Link>
        </div>
        <div className="py-2 text-sm text-gray-700 dark:text-gray-200">
          <Link
            to="https://confluence.upworkcorp.com/display/QA/QE+ChatBot+-+Central+Hub"
            target="_blank"
            className="flex items-center space-x-1 block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={() => setOpenAvatarDropdown(() => false)}
          >
            <ExternalLink className="inline" size={16} strokeWidth={1} />
            <span>About</span>
          </Link>
        </div>
        <div className="px-2 py-2 text-sm text-gray-700 dark:text-gray-200">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
