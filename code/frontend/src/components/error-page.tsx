import { useRouteError } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <>
      <ThemeSwitcher />
      <div
        id="error-page"
        className="container flex flex-col justify-center items-center min-h-[80vh]"
      >
        <h1 className="mb-10 dark:text-white">Oops!</h1>
        <p className="mb-10 dark:text-white">
          Sorry, an unexpected error has occurred.
        </p>
        <p className="dark:text-white">
          {/* <i>{error.statusText || error.message}</i> */}
          <i>
            {(error as Error)?.message ||
              (error as { statusText?: string })?.statusText}
          </i>
        </p>
      </div>
    </>
  );
}
