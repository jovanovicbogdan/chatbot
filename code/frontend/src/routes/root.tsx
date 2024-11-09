import { Link } from 'react-router-dom';
import './root.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export default function Root() {
  return (
    <>
      <ToastContainer />
      <div className="container mt-24">
        <div className="flex justify-center gap-4 flex-wrap">
          <Card
            title="QA Bot"
            description="QA bot answers questions related to JET test automation framework."
            linkTo="/qabot"
            buttonText="QA Bot"
          />
          <Card
            title="TS Bot"
            description="TS bot answers questions related to tech support knowledge base."
            linkTo="/tsbot"
            buttonText="TS Bot"
          />
        </div>
      </div>
    </>
  );
}

type CardProps = {
  title: string;
  description: string;
  linkTo: string;
  buttonText: string;
};
function Card({ title, description, linkTo, buttonText }: CardProps) {
  return (
    <>
      <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <a href="#">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h5>
        </a>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          {description}
        </p>
        <Link
          to={linkTo}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {buttonText}
          <svg
            className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </Link>
      </div>
    </>
  );
}
