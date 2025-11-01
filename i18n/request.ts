import {getRequestConfig} from 'next-intl/server';

import {notFound} from 'next/navigation';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = locale || 'en';
  if (!['en', 'he'].includes(validLocale)) notFound();

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});
