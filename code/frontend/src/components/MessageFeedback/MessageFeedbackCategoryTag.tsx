import { useState } from 'react';

export type CategoryTag = {
  name: string;
  isSelected: boolean;
};

type MessageFeedbackCategoryTagProps = {
  sendMessageFeedback: (
    feedbackComment?: string | null,
    categoryTag?: string | null,
    categoryTags?: string[] | null,
  ) => void;
};
export default function MessageFeedbackCategoryTag({
  sendMessageFeedback,
}: MessageFeedbackCategoryTagProps) {
  return (
    <div className="rounded-md p-4 bg-lightGray dark:bg-darkGray">
      <MessageFeedbackCategoryTagList
        sendMessageFeedback={sendMessageFeedback}
      />
    </div>
  );
}

type MessageFeedbackCategoryTagList = {
  sendMessageFeedback: (
    feedbackComment?: string | null,
    categoryTag?: string | null,
    categoryTags?: string[] | null,
  ) => void;
};
function MessageFeedbackCategoryTagList({
  sendMessageFeedback,
}: MessageFeedbackCategoryTagList) {
  const [feedbackComment, setFeedbackComment] = useState<string | null>(null);
  const [categoryTags, setCategoryTags] = useState<CategoryTag[]>([
    {
      name: 'Technical',
      isSelected: false,
    },
    {
      name: 'Irrelevant',
      isSelected: false,
    },
    {
      name: 'Incorrect',
      isSelected: false,
    },
    {
      name: 'Confusing',
      isSelected: false,
    },
    {
      name: 'Delay',
      isSelected: false,
    },
    {
      name: 'Other',
      isSelected: false,
    },
  ]);

  function handleCategoryClick(index: number) {
    setCategoryTags(prevCategories =>
      prevCategories.map((category, i) => ({
        ...category,
        isSelected: i === index ? !category.isSelected : false,
      })),
    );
  }

  return (
    <>
      {categoryTags.map((category, index) => (
        <span
          key={index}
          className={`cursor-pointer select-none bg-gray-100 ${
            category.isSelected ? 'border-2 border-lightSkyBlue' : ''
          } text-gray-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300`}
          onClick={() => handleCategoryClick(index)}
        >
          {category.name}
        </span>
      ))}
      <div className="mb-6">
        <input
          type="text"
          id="large-input"
          placeholder="Provide additional feedback (optional)"
          className="block w-full mt-6 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={e => setFeedbackComment(e.target.value)}
        />
      </div>
      <button
        className={`${
          categoryTags.every(ct => ct.isSelected === false)
            ? 'cursor-not-allowed opacity-50'
            : ''
        } feedback-submit-btn text-blue-500 font-medium px-4 py-2 rounded-full focus:outline-none dark:text-lightSkyBlue`}
        disabled={categoryTags.every(ct => ct.isSelected === false)}
        onClick={() =>
          sendMessageFeedback(
            feedbackComment,
            categoryTags.find(ct => ct.isSelected === true)?.name || null,
            categoryTags.map(ct => ct.name),
          )
        }
      >
        Submit
      </button>
    </>
  );
}
