import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleQuestion,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../Modal';

export default function Help() {
  const [showHelp, setShowHelp] = useState(false);
  const helpIconClassName =
    'transition text-background bg-darkGray rounded-full border border-gray-300 dark:bg-gray-400 dark:border-gray-600 dark:text-dark-background';

  function handleOnBackdropClick() {
    setShowHelp(() => !showHelp);
  }

  return (
    <>
      <button
        onClick={() => setShowHelp(() => !showHelp)}
        className="fixed right-4 bottom-4 z-30"
      >
        {showHelp ? (
          <FontAwesomeIcon
            icon={faCircleXmark}
            size="xl"
            className={helpIconClassName}
          />
        ) : (
          <FontAwesomeIcon
            icon={faCircleQuestion}
            size="xl"
            className={helpIconClassName}
            onClick={() => setShowHelp(() => !showHelp)}
          />
        )}
      </button>
      {showHelp && (
        <HelpDetails handleOnBackdropClick={handleOnBackdropClick} />
      )}
    </>
  );
}

type HelpDetailsProps = {
  handleOnBackdropClick: () => void;
};
function HelpDetails({ handleOnBackdropClick }: HelpDetailsProps) {
  return (
    <Modal onBackdropClickHandler={handleOnBackdropClick}>
      <h3 className="mb-3 text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-lightGray">
        Help
      </h3>
      <ul>
        <li>
          Currently, the QA bot is equipped solely with information about the
          JET framework. It will search the{' '}
          <a
            href="https://confluence.upworkcorp.com/display/QA/QA+JET+Testing+Framework"
            target="_blank"
            className="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline"
          >
            JET documentation
          </a>{' '}
          vector database to locate relevant information and generate a helpful
          response based on your query.
        </li>
        <li>
          Please note that the conversation is not persisted and will be{' '}
          <span className="font-bold">lost</span> upon refreshing the page.
        </li>
        <li>
          After submitting your query, please await the bot's response. There is
          no option to stop the bot once it has begun responding.
        </li>
        {/* <li>The bot is aware of chat history.</li> */}
        <li>
          Feedback can be provided for the entire conversation per session by
          clicking on the <span className="italic font-bold">feedback</span>{' '}
          text at the bottom of the page or it can be provided for individual
          messages by clicking on the{' '}
          <span className="italic font-bold">thumbsDown</span> icon at the end
          of each message.
        </li>
      </ul>
    </Modal>
  );
}
