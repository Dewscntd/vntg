import {getRequestConfig} from 'next-intl/server';

import {notFound} from 'next/navigation';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!['en', 'he'].includes(locale)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
