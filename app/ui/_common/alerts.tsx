import clsx from 'clsx';

export default function Alert({
  message,
  type,
}: {
  message: string;
  type: 'red' | 'blue' | 'green' | 'yellow' | 'grey';
}) {
  const alertClasses = clsx('p-4 mb-4 text-sm rounded-lg dark:bg-gray-800', {
    'text-red-800  bg-red-50  dark:text-red-400': type === 'red',
    'text-blue-800  bg-blue-50  dark:text-blue-400': type === 'blue',
    'text-green-800  bg-green-50  dark:text-green-400': type === 'green',
    'text-yellow-800  bg-yellow-50  dark:text-yellow-400': type === 'yellow',
    'text-grey-800  bg-grey-50  dark:text-grey-400': type === 'grey',
  });
  return (
    <div className={alertClasses} role="alert">
      {message}
    </div>
  );
}
