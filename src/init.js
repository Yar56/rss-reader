import i18n from 'i18next';
import resources from './locales';
import view from './view.js';
import controller from './controller.js';

export default () => {
  const state = {
    formState: {
      processState: 'pending', // sending
      processError: null,
      processSucces: null,
      valid: true,
      validError: '',
    },
    feeds: [],
    posts: [],
  };

  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();

  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const watchedState = view(state, i18nInstance);
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', controller(watchedState));
};
